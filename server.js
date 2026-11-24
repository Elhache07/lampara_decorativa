const express = require('express');

const app = express();
const PORT = 3000;

// ---------- Funciones de cálculo ----------

// Ecuación cuadrática con la fórmula general:
// 4x(x + k) = areaTela  ->  4x² + 4k·x − areaTela = 0
function resolverPantalla(k, areaTela) {
    const a = 4, b = 4 * k, c = -areaTela;
    const discriminante = b * b - 4 * a * c;
    if (discriminante < 0) return null;
    const x1 = (-b + Math.sqrt(discriminante)) / (2 * a);
    const x2 = (-b - Math.sqrt(discriminante)) / (2 * a);
    return { a, b, c, discriminante, x1, x2 };
}

// Ecuación lineal: lado base + v + altura pantalla = alturaTotal
function resolverVarilla(ladoBase, alturaPantalla, alturaTotal) {
    const v = alturaTotal - ladoBase - alturaPantalla;
    return { v, comprobacion: ladoBase + v + alturaPantalla };
}

// Volumen y área a barnizar del cubo
function calcularCubo(lado, caras) {
    return { volumen: Math.pow(lado, 3), area: caras * lado * lado };
}

// ---------- Utilidades de presentación ----------

function fmt(n) {
    return Number(n.toFixed(4)).toLocaleString('es-CO', { maximumFractionDigits: 4 });
}

function leerNumero(valor, porDefecto) {
    const n = Number(String(valor === undefined ? '' : valor).replace(',', '.'));
    return Number.isFinite(n) && n > 0 ? n : porDefecto;
}

const DEFECTO = { lado: 15, alturaTotal: 49, tela: 2400, k: 10, caras: 5 };

// ---------- Página HTML ----------

function paginaHTML(d) {
    const pantalla = resolverPantalla(d.k, d.tela);
    let cuadratica = '';
    let lineal = '';
    let x = null;

    if (!pantalla) {
        cuadratica = `<p class="error">El discriminante es negativo: no hay solución real con estos datos.</p>`;
    } else {
        const { a, b, c, discriminante, x1, x2 } = pantalla;
        const raiz = Math.sqrt(discriminante);
        const valida = [x1, x2].filter(r => r > 0);
        x = valida.length ? Math.max(...valida) : null;

        cuadratica = `
        <p>El área lateral son 4 rectángulos de lado <b>x</b> y altura <b>x + ${fmt(d.k)}</b>:</p>
        <p class="formula">4x(x + ${fmt(d.k)}) = ${fmt(d.tela)}</p>
        <p>Se desarrolla y se lleva a la forma general <i>ax² + bx + c = 0</i>:</p>
        <p class="formula">4x² + ${fmt(b)}x − ${fmt(d.tela)} = 0</p>
        <p>Coeficientes: <b>a = ${fmt(a)}</b>, <b>b = ${fmt(b)}</b>, <b>c = ${fmt(c)}</b></p>
        <p>Discriminante:</p>
        <p class="formula">D = b² − 4ac = (${fmt(b)})² − 4(${fmt(a)})(${fmt(c)}) = ${fmt(discriminante)}</p>
        <p>Fórmula general:</p>
        <p class="formula">x = (−b ± √D) / 2a = (−${fmt(b)} ± √${fmt(discriminante)}) / ${fmt(2 * a)} = (−${fmt(b)} ± ${fmt(raiz)}) / ${fmt(2 * a)}</p>
        <p class="formula">x₁ = (−${fmt(b)} + ${fmt(raiz)}) / ${fmt(2 * a)} = <b>${fmt(x1)}</b></p>
        <p class="formula">x₂ = (−${fmt(b)} − ${fmt(raiz)}) / ${fmt(2 * a)} = <b>${fmt(x2)}</b></p>`;

        if (x === null) {
            cuadratica += `<p class="error">Ninguna raíz es positiva, por lo que no existe una longitud válida.</p>`;
        } else {
            const altura = x + d.k;
            cuadratica += `
        <p>Una longitud no puede ser negativa, por eso se descarta la raíz negativa.</p>
        <p class="resultado">Lado de la base de la pantalla: x = ${fmt(x)} cm &nbsp;|&nbsp; Altura de la pantalla: x + ${fmt(d.k)} = ${fmt(altura)} cm</p>
        <p>Verificación: 4 · ${fmt(x)} · ${fmt(altura)} = ${fmt(4 * x * altura)} cm²</p>`;

            const { v, comprobacion } = resolverVarilla(d.lado, altura, d.alturaTotal);
            lineal = `
        <p>La altura total es la suma de la base, la varilla y la pantalla:</p>
        <p class="formula">${fmt(d.lado)} + v + ${fmt(altura)} = ${fmt(d.alturaTotal)}</p>
        <p class="formula">v = ${fmt(d.alturaTotal)} − ${fmt(d.lado)} − ${fmt(altura)} = <b>${fmt(v)}</b></p>
        ${v < 0
            ? `<p class="error">La varilla resulta negativa: con estos datos la lámpara no es posible.</p>`
            : `<p class="resultado">Longitud de la varilla: v = ${fmt(v)} cm</p>
        <p>Verificación: ${fmt(d.lado)} + ${fmt(v)} + ${fmt(altura)} = ${fmt(comprobacion)} cm</p>`}`;
        }
    }

    if (!lineal) {
        lineal = `<p class="error">No se puede plantear esta ecuación sin la altura de la pantalla (paso 1).</p>`;
    }

    const cubo = calcularCubo(d.lado, d.caras);
    const volumenHTML = `
        <p class="formula">V = a³ = ${fmt(d.lado)}³ = <b>${fmt(cubo.volumen)} cm³</b></p>
        <p class="formula">A = ${d.caras}a² = ${d.caras} · ${fmt(d.lado)}² = <b>${fmt(cubo.area)} cm²</b></p>
        <p class="resultado">Volumen de madera: ${fmt(cubo.volumen)} cm³ &nbsp;|&nbsp; Área a barnizar: ${fmt(cubo.area)} cm² (${d.caras} caras)</p>`;

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lámpara decorativa</title>
<style>
    body { font-family: Arial, sans-serif; max-width: 820px; margin: 30px auto; padding: 0 16px; color: #222; background: #f7f7f4; }
    h1 { color: #7a4a1e; }
    h2 { color: #7a4a1e; border-bottom: 2px solid #d9c3a5; padding-bottom: 4px; margin-top: 32px; }
    form { background: #fff; border: 1px solid #d9c3a5; border-radius: 8px; padding: 16px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    label { display: flex; flex-direction: column; font-size: 14px; gap: 4px; }
    input, select { padding: 6px; font-size: 15px; }
    button { grid-column: 1 / -1; padding: 10px; font-size: 16px; background: #7a4a1e; color: #fff; border: 0; border-radius: 6px; cursor: pointer; }
    .formula { font-family: "Courier New", monospace; background: #fff; border-left: 4px solid #d9c3a5; padding: 6px 10px; margin: 6px 0; overflow-x: auto; }
    .resultado { background: #e6f2e6; border: 1px solid #9cc79c; padding: 8px 10px; border-radius: 6px; font-weight: bold; }
    .error { background: #fbe9e7; border: 1px solid #e0a39b; padding: 8px 10px; border-radius: 6px; }
</style>
</head>
<body>
    <h1>Lámpara decorativa</h1>
    <p>Base cúbica de madera, varilla y pantalla en forma de prisma de base cuadrada abierta arriba y abajo.</p>

    <form method="GET" action="/">
        <label>Lado del cubo (cm)
            <input type="number" step="any" min="0.01" name="lado" value="${d.lado}">
        </label>
        <label>Altura total de la lámpara (cm)
            <input type="number" step="any" min="0.01" name="alturaTotal" value="${d.alturaTotal}">
        </label>
        <label>Tela disponible (cm²)
            <input type="number" step="any" min="0.01" name="tela" value="${d.tela}">
        </label>
        <label>La pantalla es más alta que su lado por (cm)
            <input type="number" step="any" min="0.01" name="k" value="${d.k}">
        </label>
        <label>Caras del cubo a barnizar
            <select name="caras">
                <option value="5"${d.caras === 5 ? ' selected' : ''}>5 (la base apoya en la mesa)</option>
                <option value="6"${d.caras === 6 ? ' selected' : ''}>6 (todas)</option>
            </select>
        </label>
        <button type="submit">Calcular</button>
    </form>

    <h2>1) Ecuación cuadrática: tela de la pantalla</h2>
    ${cuadratica}

    <h2>2) Ecuación lineal: longitud de la varilla</h2>
    ${lineal}

    <h2>3) Volumen y área a barnizar del cubo</h2>
    ${volumenHTML}
</body>
</html>`;
}

// ---------- Rutas ----------

app.get('/', (req, res) => {
    const d = {
        lado: leerNumero(req.query.lado, DEFECTO.lado),
        alturaTotal: leerNumero(req.query.alturaTotal, DEFECTO.alturaTotal),
        tela: leerNumero(req.query.tela, DEFECTO.tela),
        k: leerNumero(req.query.k, DEFECTO.k),
        caras: Number(req.query.caras) === 6 ? 6 : 5
    };
    res.send(paginaHTML(d));
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
