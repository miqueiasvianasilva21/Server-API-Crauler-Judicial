import express from "express"
import cors from "cors";
const app = express();
const port = 3000;
import { dadosPrimeiroGrau } from "./utils/dadosPrimeiroGrau.mjs" 
import { dadosSegundoGrau } from "./utils/dadosSegundoGrau.mjs";

app.use(express.json());
app.use(cors())

app.post('/buscar-processo', async (req, res) => {
  const { numero, tribunal, opcao } = req.body;


  let dominio = ''; // para definir o dominio do site que será acessado pelo puppeter

  if (!numero) {
    return res.status(400).json({ error: 'Número do processo não fornecido' });
  }


  if (tribunal === 'tjce') {// o tribunal tjce tem domínio esaf e a requisição fica na forma esaj.tjce
    dominio = 'esaj';
  } else if (tribunal === 'tjal') {
    dominio = 'www2'; // o tribunal tjal tem domínio www2 e a requisição fica na forma www2.tjal
  }

  if (opcao === '1') { // se a opção selecionada foi 1 ele retorna apenas os dados do primeiro grau do processo
    try {
      const primeiroGrau = await dadosPrimeiroGrau(dominio, tribunal, numero);
      res.json(primeiroGrau);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (opcao === '2') { // se a opção selecionada foi 2 ele retorna apenas os dados do segundo grau do processo
    try {
      const segundoGrau = await dadosSegundoGrau(dominio, tribunal, numero);
      res.json(segundoGrau);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (opcao === '3') { // se a opção selecionada foi 3 ele retorna os dados em primeiro e segundo grau do processo
    try {
      const [primeiroGrau, segundoGrau] = await Promise.all([
        dadosPrimeiroGrau(dominio, tribunal, numero),
        dadosSegundoGrau(dominio, tribunal, numero)
      ]);

      res.json({ primeiroGrau, segundoGrau });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
});
app.get("/", (req, res) => {
  res.send('O Servidor está funcionando');
});

app.listen(port, () => {
  console.log(`Servidor está executando na porta ${port}`);
});

