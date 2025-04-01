document.addEventListener('DOMContentLoaded', function() {
    async function carregarRelatorios() {
        try {
            const resposta = await fetch('https://64.23.215.68:8080/reports');
            if (!resposta.ok) {
                throw new Error(`Erro na requisição: ${resposta.status}`);
            }
            const dados = await resposta.json();
            atualizarRelatorios(dados);
        } catch (erro) {
            console.error('Erro ao carregar relatórios:', erro);
            exibirMensagemErro('Erro ao carregar relatórios. Tente novamente.');
        } finally {
            esconderLoading();
        }
    }

    function atualizarRelatorios(dados) {
        atualizarEstatisticas(dados.estatisticas);
        atualizarGraficoCrescimento(dados.crescimentoUsuarios);
        atualizarTabelaProvincias(dados.distribuicaoProvincias);
        atualizarTabelaConteudo(dados.analiseConteudo);
    }

    function atualizarEstatisticas(estatisticas) {
        document.getElementById('totalUsuarios').textContent = estatisticas.totalUsuarios;
        document.getElementById('novosUsuariosMes').textContent = estatisticas.novosUsuariosMes;
        document.getElementById('totalMensagens').textContent = estatisticas.totalMensagens;
        document.getElementById('taxaEngajamento').textContent = estatisticas.taxaEngajamento + '%';
    }

    function atualizarGraficoCrescimento(crescimentoUsuarios) {
        const chartContainer = document.getElementById('graficoCrescimento');
        chartContainer.innerHTML = ''; // Limpar gráfico existente
        const valores = crescimentoUsuarios.map(item => item.valor);
        const labels = crescimentoUsuarios.map(item => item.mes);
        const maxValor = Math.max(...valores);
        const alturaBase = 200; // altura maxima do grafico

        valores.forEach((valor, index) => {
            const altura = (valor / maxValor) * alturaBase;
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = `${altura}px`;
            bar.style.left = `${50 + index * 50}px`;
            chartContainer.appendChild(bar);
        });

        const axis = document.createElement('div');
        axis.className = 'chart-axis';
        labels.forEach(label => {
            const labelElement = document.createElement('div');
            labelElement.className = 'chart-label';
            labelElement.textContent = label;
            axis.appendChild(labelElement);
        });
        chartContainer.appendChild(axis);

        const yAxis = document.createElement('div');
        yAxis.className = 'chart-y-axis';
        const yLabels = [maxValor, maxValor * 0.8, maxValor * 0.6, maxValor * 0.4, maxValor * 0.2, 0];
        yLabels.forEach(label => {
            const labelElement = document.createElement('div');
            labelElement.className = 'chart-label';
            labelElement.textContent = label;
            yAxis.appendChild(labelElement);
        });
        chartContainer.appendChild(yAxis);
    }

    function atualizarTabelaProvincias(distribuicaoProvincias) {
        const tbody = document.querySelector('#tabelaProvincias tbody');
        tbody.innerHTML = ''; // Limpar tabela existente
        let totalUsuarios = 0;
        let totalAtivos = 0;
        let crescimentoTotal = 0;
        let engajamentoTotal = 0;

        distribuicaoProvincias.forEach(provincia => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${provincia.provincia}</td>
                <td>${provincia.usuarios}</td>
                <td>${provincia.ativos}</td>
                <td>${provincia.percentualTotal}</td>
                <td>${provincia.crescimento}</td>
                <td>
                    <div style="width: 80%; height: 5px; background: #eee; border-radius: 5px;">
                        <div style="width: ${provincia.engajamento}%; height: 100%; background: var(--success); border-radius: 5px;"></div>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);

            totalUsuarios += provincia.usuarios;
            totalAtivos += provincia.ativos;
            crescimentoTotal += provincia.crescimento;
            engajamentoTotal += provincia.engajamento;
        });

        document.getElementById('totalUsuariosTabela').textContent = totalUsuarios;
        document.getElementById('totalAtivosTabela').textContent = totalAtivos;
        document.getElementById('crescimentoTotalTabela').textContent = crescimentoTotal;
        document.getElementById('engajamentoTotalTabela').innerHTML = `<div style="width: 80%; height: 5px; background: #eee; border-radius: 5px;"><div style="width: ${engajamentoTotal / distribuicaoProvincias.length}%; height: 100%; background: var(--success); border-radius: 5px;"></div></div>`;
    }

    function atualizarTabelaConteudo(analiseConteudo) {
        const tbody = document.querySelector('#tabelaConteudo tbody');
        tbody.innerHTML = ''; // Limpar tabela existente
        analiseConteudo.forEach(conteudo => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${conteudo.tipoConteudo}</td>
                <td>${conteudo.total}</td>
                <td>${conteudo.visualizacoes}</td>
                <td>${conteudo.comentarios}</td>
                <td>
                    <div style="width: 80%; height: 5px; background: #eee; border-radius: 5px;">
                        <div style="width: ${conteudo.engajamento}%; height: 100%; background: var(--success); border-radius: 5px;"></div>
                    </div>
                </td>
                <td><i class="fas fa-arrow-${conteudo.tendencia.direcao}" style="color: var(--${conteudo.tendencia.cor});"></i> ${conteudo.tendencia.valor}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function exibirMensagemErro(mensagem) {
        // Implementar exibição de mensagem de erro na página
        console.log(mensagem);
    }

    function esconderLoading() {
        document.querySelector('.loading-indicator').style.display = 'none';
    }

    // Função para exportar dados da tabela para CSV
    function exportarTabelaParaCSV(tabelaId, nomeArquivo) {
        const tabela = document.getElementById(tabelaId);
        const linhas = Array.from(tabela.querySelectorAll('tr'));

        // Extrair dados das células
        const dados = linhas.map(linha => {
            const celulas = Array.from(linha.querySelectorAll('td, th'));
            return celulas.map(celula => celula.textContent).join(',');
        }).join('\n');

        // Criar link para download
        const elementoA = document.createElement('a');
        elementoA.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(dados));
        elementoA.setAttribute('download', nomeArquivo);
        elementoA.style.display = 'none';
        document.body.appendChild(elementoA);
        elementoA.click();
        document.body.removeChild(elementoA);
    }

    // Adicionar evento de clique ao botão de exportação
    const botaoExportar = document.querySelector('.btn-primary'); // Seleciona o botão de exportação
    botaoExportar.addEventListener('click', function() {
        exportarTabelaParaCSV('tabelaProvincias', 'distribuicao_provincias.csv');
    });

    carregarRelatorios();
});


function checkAuth() {
    const token = getAuthToken();
    if (!token) {
        // Redirecionar para a página de login se não estiver autenticado
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

(async function init() {
  checkAuth()
})()