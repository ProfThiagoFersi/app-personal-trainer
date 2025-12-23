 const SENHA_MESTRA = "1234"; 
let treinoAtual = '';
let intervaloTimer;
let meuGrafico;
const somAlerta = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');

// 1. LOGIN
function verificarSenha() {
    const senha = document.getElementById('senhaInput').value;
    if (senha === SENHA_MESTRA) {
        document.getElementById('loginArea').style.display = "none";
        document.getElementById('appConteudo').style.display = "block";
        carregarDados();
    } else {
        alert("Senha Errada!");
    }
}

// 2. CÁLCULOS E PERSISTÊNCIA
function calcularTudo() {
    const d = {
        nome: document.getElementById('nome').value,
        peso: parseFloat(document.getElementById('peso').value),
        altura: parseFloat(document.getElementById('altura').value),
        idade: parseInt(document.getElementById('idade').value),
        genero: document.getElementById('genero').value,
        atividade: parseFloat(document.getElementById('atividade').value),
        cintura: parseFloat(document.getElementById('cintura').value),
        pescoco: parseFloat(document.getElementById('pescoco').value)
    };

    localStorage.setItem('dadosAtleta', JSON.stringify(d));
    atualizarEcra(d);
    salvarNoHistorico(d.peso);
}

function atualizarEcra(d) {
    const imc = d.peso / ((d.altura/100) * (d.altura/100));
    document.getElementById('resIMC').innerText = imc.toFixed(2);
    
    let tmb = d.genero === "masculino" 
        ? 66.47 + (13.75 * d.peso) + (5.003 * d.altura) - (6.755 * d.idade)
        : 655.1 + (9.563 * d.peso) + (1.85 * d.altura) - (4.676 * d.idade);
    
    document.getElementById('resCalorias').innerText = Math.round(tmb * d.atividade);
    document.getElementById('resGordura').innerText = ((d.cintura - d.pescoco) * 0.5).toFixed(1) + "%";
}

// 3. GRÁFICO
function salvarNoHistorico(peso) {
    let hist = JSON.parse(localStorage.getItem('histPeso')) || [];
    hist.push({ data: new Date().toLocaleDateString(), peso: peso });
    if(hist.length > 7) hist.shift();
    localStorage.setItem('histPeso', JSON.stringify(hist));
    renderizarGrafico(hist);
}

function renderizarGrafico(dados) {
    const ctx = document.getElementById('graficoPeso').getContext('2d');
    if(meuGrafico) meuGrafico.destroy();
    meuGrafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dados.map(i => i.data),
            datasets: [{ label: 'Peso (kg)', data: dados.map(i => i.peso), borderColor: '#adff2f' }]
        }
    });
}

// 4. TREINOS E PDF
function configurarTreino(tipo) {
    treinoAtual = tipo;
    document.getElementById('areaEditor').style.display = 'block';
    document.getElementById('tituloTreino').innerText = "Editar Treino " + tipo;
    document.getElementById('textoTreino').value = localStorage.getItem('t_'+tipo) || '';
    mostrarTreino(tipo);
}

function salvarTreino() {
    localStorage.setItem('t_'+treinoAtual, document.getElementById('textoTreino').value);
    mostrarTreino(treinoAtual);
    alert("Treino Guardado!");
}

function mostrarTreino(tipo) {
    const txt = localStorage.getItem('t_'+tipo) || "Vazio";
    document.getElementById('exibicaoTreino').innerHTML = `<h4>TREINO ${tipo}</h4><p>${txt.replace(/\n/g, '<br>')}</p>`;
}

function gerarPDF() {
    const element = document.getElementById('exibicaoTreino');
    html2pdf().from(element).save(`Treino_${treinoAtual}.pdf`);
}

// 5. TIMER
function iniciarTimer(s) {
    pararTimer();
    intervaloTimer = setInterval(() => {
        s--;
        const m = Math.floor(s/60);
        const sec = s%60;
        document.getElementById('timerDisplay').innerText = `${m}:${sec < 10 ? '0'+sec : sec}`;
        if(s <= 0) { pararTimer(); somAlerta.play(); alert("Tempo Esgotado!"); }
    }, 1000);
}
function pararTimer() { clearInterval(intervaloTimer); }

function novoAluno() {
    if(confirm("Apagar tudo?")) { localStorage.clear(); location.reload(); }
}

function carregarDados() {
    const d = JSON.parse(localStorage.getItem('dadosAtleta'));
    if(d) {
        document.getElementById('nome').value = d.nome;
        document.getElementById('peso').value = d.peso;
        document.getElementById('altura').value = d.altura;
        document.getElementById('idade').value = d.idade;
        atualizarEcra(d);
    }
    const h = JSON.parse(localStorage.getItem('histPeso'));
    if(h) renderizarGrafico(h);
}