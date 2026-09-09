(() => {
  const data = window.CURRENT_MARKET_SUMMARY;
  if (!data) return;

  data.marketPosition = {
    note: '1º = menor mensalidade. Só entram comparações com público e frequência equivalentes. Valores confirmados sem classificação equivalente continuam na tabela, mas ficam fora do ranking.',
    items: [
      {
        label: 'Natação 2x · Sócio',
        caixeiros: 'R$ 170',
        position: '3º de 5',
        comparison: 'Mediana concorrentes: R$ 163 · Caixeiros 4,3% acima',
        base: 'GNG R$ 148 · ACM R$ 152 · Recreio R$ 174 · GNU R$ 249'
      },
      {
        label: 'Hidroginástica 2x · Sócio',
        caixeiros: 'R$ 170',
        position: 'Dentro da faixa',
        comparison: 'Concorrentes confirmados: R$ 124 a R$ 204',
        base: 'ACM R$ 124 · GNG R$ 163 · Recreio Dia R$ 151 / Noite R$ 204. GNU publica plano mensal sem frequência equivalente.'
      },
      {
        label: 'Vôlei escola 2x · Sócio',
        caixeiros: 'R$ 170',
        position: '2º de 3',
        comparison: 'Mediana concorrentes: R$ 153 · Caixeiros 11,1% acima',
        base: 'GNG R$ 109 · GNU R$ 197. Recreio R$ 147 está confirmado, mas fora do ranking porque a tabela não classifica a categoria como escola equivalente.'
      }
    ]
  };
})();