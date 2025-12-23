// --- CONFIGURAÇÕES ---
const SENHA_MESTRA = "1234"; 
let treinoAtual = '';
let intervaloTimer;
let meuGrafico;
const somAlerta = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');

// --- 1. LOGIN ---
function verificarSenha() {
    const input = document.getElementById('senhaInput').value;
    if (input === SENHA_MESTRA) {
        document.getElementById('loginArea').style.display = 'none';
        document.getElementById('appConteudo').style.display = 'block';
        carregarDadosSalvos();
    } else {
        alert("Senha incorreta!");
    }
}

// --- 2. CÁLCULOS ---
function calcularTudo() {
    const d = {
        nome: document.getElementById('nome').value,
        peso: parseFloat(document.getElementById('peso').value) || 0,
        altura: parseFloat(document.getElementById('altura').value) || 0,
        idade: parseInt(document.getElementById('idade').value) || 0,
        genero: document.getElementById('genero').value,
        atividade: parseFloat(document.getElementById('atividade').value),
        cintura: parseFloat(document.getElementById('cintura').value) || 0,
        pescoco: parseFloat(document.getElementById('pescoco').value) || 0
    };

    if (d.peso <= 0 || d.altura <= 0) return alert("Preencha Peso e Altura!");

    localStorage.setItem('dadosAtleta', JSON.stringify(d));

    // Cálculos
    const imc = d.peso / ((d.altura/100) ** 2);
    document.getElementById('resIMC').innerText = imc.toFixed(1);

    let tmb = d.genero === "masculino" 
        ? 66.47 + (13.75 * d.peso) + (5.003 * d.altura) - (6.755 * d.idade)
        : 655.1 + (9.563 * d.peso) + (1.85 * d.altura) - (4.676 * d.idade);
    
    document.getElementById('resCalorias').innerText = Math.round(tmb * d.atividade);
    document.getElementById('resGordura').innerText = ((d.cintura - d.pescoco) * 0.5).toFixed(1) + "%";

    atualizarGrafico(d.peso);
}

// --- 3. GRÁFICO ---
function atualizarGrafico(peso) {
    let hist = JSON.parse(localStorage.getItem('histPeso')) || [];
    const data = new Date().toLocaleDateString();

    if(hist.length === 0 || hist[hist.length-1].data !== data) {
        hist.push({data, peso});
    } else {
        hist[hist.length-1].peso = peso;
    }

    if(hist.length > 7) hist.shift();
    localStorage.setItem('histPeso', JSON.stringify(hist));

    const ctx = document.getElementById('graficoPeso').getContext('2d');
    if(meuGrafico) meuGrafico.destroy();
    meuGrafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hist.map(h => h.data),
            datasets: [{ label: 'Peso (kg)', data: hist.map(h => h.peso), borderColor: '#adff2f', tension: 0.3 }]
        }
    });
}

// --- 4. TREINOS ---
function configurarTreino(t) {
    treinoAtual = t;
    document.getElementById('areaEditor').style.display = 'block';
    document.getElementById('tituloTreino').innerText = "Treino " + t;
    document.getElementById('textoTreino').value = localStorage.getItem('t_'+t) || '';
    exibirTreino(t);
}

function salvarTreino() {
    const txt = document.getElementById('textoTreino').value;
    localStorage.setItem('t_'+treinoAtual, txt);
    exibirTreino(treinoAtual);
    alert("Treino Guardado!");
}

function exibirTreino(t) {
    document.getElementById('exibicaoTreino').innerText = localStorage.getItem('t_'+t) || "Sem exercícios.";
}

// --- 5. PDF (VERSÃO BLINDADA) ---
function gerarPDF() {
    const nome = document.getElementById('nome').value || "Atleta";
    const imc = document.getElementById('resIMC').innerText;
    const cal = document.getElementById('resCalorias').innerText;
    const treinoTxt = document.getElementById('exibicaoTreino').innerText;

    const areaPdf = document.createElement('div');
    Object.assign(areaPdf.style, { padding: '40px', color: 'black', background: 'white', fontFamily: 'Arial' });

    areaPdf.innerHTML = `
        <h1 style="text-align:center; color: #2d5a27;">PLANO DE TREINO PROFISSIONAL</h1>
        <hr>
        <p><strong>ATLETA:</strong> ${nome.toUpperCase()}</p>
        <p><strong>AVALIAÇÃO:</strong> IMC: ${imc} | Meta: ${cal} kcal/dia</p>
        <div style="margin-top:20px; border: 1px solid #ccc; padding: 15px;">
            <h3>TREINO ${treinoAtual || 'A'}</h3>
            <p style="white-space: pre-line;">${treinoTxt}</p>
        </div>
    `;

    document.body.appendChild(areaPdf); // Temporário para renderizar

    html2pdf().set({
        margin: 10,
        filename: `Ficha_${nome}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(areaPdf).save().then(() => {
        document.body.removeChild(areaPdf);
    });
}

// --- 6. TIMER ---
function iniciarTimer(s) {
    pararTimer();
    const display = document.getElementById('timerDisplay');
    intervaloTimer = setInterval(() => {
        s--;
        const min = Math.floor(s/60);
        const seg = s%60;
        display.innerText = `${min}:${seg < 10 ? '0'+seg : seg}`;
        if(s <= 0) { pararTimer(); somAlerta.play(); alert("Descanso Terminado!"); }
    }, 1000);
}
function pararTimer() { clearInterval(intervaloTimer); }

// --- 7. UTILS ---
function novoAluno() {
    if(confirm("Apagar todos os dados?")) { localStorage.clear(); location.reload(); }
}

function carregarDadosSalvos() {
    const d = JSON.parse(localStorage.getItem('dadosAtleta'));
    if(d) {
        document.getElementById('nome').value = d.nome;
        document.getElementById('peso').value = d.peso;
        document.getElementById('altura').value = d.altura;
        document.getElementById('idade').value = d.idade;
        calcularTudo();
    }
}