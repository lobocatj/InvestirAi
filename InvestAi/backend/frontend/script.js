async function carregarCarteira() {
    try {
        const resposta = await fetch("http://127.0.0.1:8000/carteira");
        const dados = await resposta.json();

        document.getElementById("investido").innerHTML = "R$ " + dados.total_investido.toFixed(2);
        document.getElementById("atual").innerHTML = "R$ " + dados.valor_atual_estimado.toFixed(2);
        document.getElementById("lucro").innerHTML = "R$ " + dados.lucro_estimado.toFixed(2);

        let listaContainer = document.getElementById("lista");
        listaContainer.innerHTML = "";

        dados.investimentos.forEach(item => {
            listaContainer.innerHTML += `
            <div class="item-lista">
                <div class="item-info">
                    <h4>${item.nome}</h4>
                    <p>Quantidade: ${item.quantidade}</p>
                </div>
                <div class="item-valor">
                    <h4>R$ ${item.valor.toFixed(2)}</h4>
                    <p><i class="fa-solid fa-arrow-trend-up"></i> ${((item.rendimento * 100).toFixed(2))}%</p>
                </div>
                <button onclick="excluirInvestimento(${item.id})" class="btn-excluir">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            `;
        });

        gerarGrafico(dados.valor_atual_estimado);

    } catch (erro) {
        console.error("Erro ao puxar dados da API:", erro);
    }
}

function gerarGrafico(valorAtual) {
    const ctx = document.getElementById('grafico').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Hoje'],
            datasets: [{
                label: 'Evolução do Patrimônio (R$)',
                data: [0, valorAtual * 0.2, valorAtual * 0.5, valorAtual * 0.7, valorAtual * 0.9, valorAtual],
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#38bdf8'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

async function adicionarInvestimento() {
    await fetch(
        "http://127.0.0.1:8000/investimentos",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome: document.getElementById("nome").value,
                valor: Number(document.getElementById("valor").value),
                rendimento: Number(document.getElementById("rendimento").value)
            })
        }
    );

    carregarCarteira();
}

async function excluirInvestimento(id) {
    const confirmar = confirm("Tem certeza que deseja excluir este investimento?");
    if (confirmar) {
        try {
            await fetch(`http://127.0.0.1:8000/investimentos/${id}`, {
                method: "DELETE"
            });
            carregarCarteira();
        } catch (erro) {
            console.error("Erro ao excluir:", erro);
            alert("Não foi possível excluir o investimento.");
        }
    }
}

carregarCarteira();
