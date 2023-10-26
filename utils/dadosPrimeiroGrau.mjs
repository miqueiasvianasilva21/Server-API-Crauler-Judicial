import puppeteer from "puppeteer"; 

export async function dadosPrimeiroGrau(dominio,tribunal,numero) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(`https://${dominio}.${tribunal}.jus.br/cpopg/show.do?processo.codigo=4000001YI0000&processo.foro=144&processo.numero=${numero}`); // o puppeter acessa essa página para procurar os elementos desejados

    const processo = await page.evaluate(() => { // função que pega o id do elemento e retorna o conteúdo de texto dele
      const getElementText = (elementId) => {
        const element = document.getElementById(elementId);
        return element ? element.textContent.trim() : '-'; // se o elemento estiver vazio retorna '-'
      };

      const classeProcesso = getElementText("classeProcesso");
      if (classeProcesso == '-') { // verificando se o processo tem classe, caso não tenha ele não foi acessado
        return "O PROCESSO NÃO EXISTE OU NÃO CORRESPONDE AO TRIBUNAL SELECIONADO";
      }

      // Obtenção dos elementos por id
      const assunto = getElementText("assuntoProcesso");
      const dataHora = getElementText("dataHoraDistribuicaoProcesso");
      const juiz = getElementText("juizProcesso");
      const valor = getElementText("valorAcaoProcesso");
      const area = getElementText("areaProcesso");
      
      // obtendo o vetor de movimentações
      const movimentacoes = [];
      const rows = Array.from(document.querySelectorAll('.containerMovimentacao'));

      rows.forEach((row) => {
        const dataMovimentacao = row.querySelector('.dataMovimentacao') ? row.querySelector('.dataMovimentacao').textContent.trim().replace(/[\t\n\r]/g, '') : '-'; //remove caracteres indesejados
        const descricaoMovimentacao = row.querySelector('.descricaoMovimentacao') ? row.querySelector('.descricaoMovimentacao').textContent.trim().replace(/[\t\r]/g, '').replace(/\n/g, ' ') : '-'; 
        movimentacoes.push({ dataMovimentacao, descricaoMovimentacao }); // pega cada data e descrição e adiciona no vetor
      });

      const dados = {
        classeProcesso,
        area,
        assunto,
        dataHora,
        juiz,
        valor,
        movimentacoes,
      };

      return dados;// armazena os dados em "processo"
    });

    return processo;// retorna o "processo"
  } catch (error) {
    throw new Error('Ocorreu um erro ao buscar os dados do processo');
  } finally {
    await browser.close();
  }
}