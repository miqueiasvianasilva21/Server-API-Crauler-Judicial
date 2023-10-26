import puppeteer from "puppeteer";

export async function dadosSegundoGrau(dominio,tribunal,numero) {
    const browser = await puppeteer.launch();//inicializa o navegador
    const page = await browser.newPage();//inicializa a página
  
    try {
      await page.goto(`https://${dominio}.${tribunal}.jus.br/cposg5/search.do?conversationId=&paginaConsulta=0&cbPesquisa=NUMPROC&numeroDigitoAnoUnificado=0710802-55.2018&foroNumeroUnificado=0001&dePesquisaNuUnificado=${numero}&dePesquisaNuUnificado=UNIFICADO&dePesquisa=&tipoNuProcesso=UNIFICADO`); // essa página é acessada para obter o código do processo em segundo grau. O código do processo se encontra no value do item de id = "processoSelecionado"
      
  
      const codigo = await page.evaluate(() => { // função para obter o value do processoSelecionado
        return document.getElementById("processoSelecionado").value;
      });
  
      await page.goto(`https://${dominio}.${tribunal}.jus.br/cposg5/show.do?processo.codigo=${codigo}`);// essa é a página para um processo em segundo grau utilizando o "código". O browser a acessa para fazer a raspagem dos dados 
  
      const processo = await page.evaluate(() => { // funcao que vai receber e retornar os dados do processo
        const getElementText = (elementId) => { // função que pega o id do elemento e retorna o conteúdo de texto dele
          const element = document.getElementById(elementId);
          return element ? element.textContent.trim() : '-';
        };
        
        // Obtenção dos elementos por id utilizando a funçaõ getElementText
        const classeProcesso = getElementText("classeProcesso");
        const assunto = getElementText("assuntoProcesso");
        const dataHora = getElementText("dataHoraDistribuicaoProcesso");
        const juiz = getElementText("juizProcesso");
        const valor = getElementText("valorAcaoProcesso");
        const area = getElementText("areaProcesso");
        
        // Obtenção do vetor de movimentações
        const movimentacoes = [];
        const rows = Array.from(document.querySelectorAll('#tabelaTodasMovimentacoes tr')); // obtendo a tabela de movimentações
  
        rows.forEach((row) => {
          const dataMovimentacao = row.querySelector('.dataMovimentacaoProcesso').textContent.trim();
          let descricaoMovimentacao = row.querySelector('.descricaoMovimentacaoProcesso').textContent.trim();
  
          descricaoMovimentacao = descricaoMovimentacao.replace(/\n/g, ' ').trim();
  
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
  
        return dados;
      });
  
      await browser.close();
  
      return processo;
  
    } catch (error) {
      console.error("Ocorreu um erro na raspagem de dados:", error);
      await browser.close();
      return null;
    } finally {
      await browser.close();
    }
  }