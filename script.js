const rowsAInput = document.getElementById("rowsA");
const colsAInput = document.getElementById("colsA");
const rowsBInput = document.getElementById("rowsB");
const colsBInput = document.getElementById("colsB");
const operationInput = document.getElementById("operation");

const matrixAContainer = document.getElementById("matrixA");
const matrixBContainer = document.getElementById("matrixB");
const resultContainer = document.getElementById("matrixResult");

const createButton = document.getElementById("createMatrices");
const calculateButton = document.getElementById("calculate");
const message = document.getElementById("message");
const operatorSymbol = document.getElementById("operatorSymbol");

let matrixAInputs = [];
let matrixBInputs = [];
let matrixA = [];
let matrixB = [];
let matrixHasil = [];

function getDimensions() {
  return {
    rowsA: Number(rowsAInput.value),
    colsA: Number(colsAInput.value),
    rowsB: Number(rowsBInput.value),
    colsB: Number(colsBInput.value)
  };
}

function dimensionsAreValid({ rowsA, colsA, rowsB, colsB }) {
  const values = [rowsA, colsA, rowsB, colsB];

  if (values.some(value => !Number.isInteger(value) || value < 1 || value > 20)) {
    showMessage("Ukuran matrix harus berupa bilangan bulat antara 1 sampai 20.", "error");
    return false;
  }

  const operation = operationInput.value;

  if (operation === "add" || operation === "subtract") {
    if (rowsA !== rowsB || colsA !== colsB) {
      showMessage("Penjumlahan/pengurangan membutuhkan ukuran Matrix A dan B yang sama.", "error");
      return false;
    }
  } else if (operation === "multiply") {
    if (colsA !== rowsB) {
      showMessage("Perkalian tidak valid: Kolom A harus sama dengan Baris B.", "error");
      return false;
    }
  }

  return true;
}

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = type;
}

function updateOperator() {
  const operation = operationInput.value;
  operatorSymbol.textContent =
    operation === "add" ? "+" :
    operation === "subtract" ? "−" : "×";
}

function createMatrixInput(container, rows, cols, matrixName) {
  container.innerHTML = "";
  container.style.gridTemplateColumns = `repeat(${cols}, 64px)`;

  const matrix = [];

  for (let i = 0; i < rows; i++) {
    const row = [];

    for (let j = 0; j < cols; j++) {
      const input = document.createElement("input");
      input.type = "number";
      input.step = "any";
      input.value = "0";
      input.className = "matrix-cell";
      input.setAttribute("aria-label", `${matrixName}[${i}][${j}]`);
      input.dataset.row = i;
      input.dataset.col = j;
      row.push(input);
      container.appendChild(input);
    }

    matrix.push(row);
  }

  return matrix;
}

function createMatrices() {
  const dimensions = getDimensions();

  if (!dimensionsAreValid(dimensions)) {
    calculateButton.disabled = true;
    matrixAContainer.innerHTML = "";
    matrixBContainer.innerHTML = "";
    resultContainer.innerHTML = "";
    return;
  }

  const { rowsA, colsA, rowsB, colsB } = dimensions;

  matrixAInputs = createMatrixInput(matrixAContainer, rowsA, colsA, "A");
  matrixBInputs = createMatrixInput(matrixBContainer, rowsB, colsB, "B");

  document.getElementById("sizeA").textContent = `${rowsA} × ${colsA}`;
  document.getElementById("sizeB").textContent = `${rowsB} × ${colsB}`;
  document.getElementById("sizeResult").textContent = "Belum dihitung";

  resultContainer.innerHTML = "";
  calculateButton.disabled = false;
  showMessage("Ukuran matrix valid. Silakan isi elemen Matrix A dan B.", "success");
}

function readMatrix(matrixInputs, matrixName) {
  return matrixInputs.map((row, i) =>
    row.map((input, j) => {
      const value = input.value.trim();

      if (value === "" || !Number.isFinite(Number(value))) {
        throw new Error(`Masukkan angka yang valid pada ${matrixName}[${i}][${j}].`);
      }

      return Number(value);
    })
  );
}

function calculateMatrices() {
  try {
    const dimensions = getDimensions();

    if (!dimensionsAreValid(dimensions)) {
      return;
    }

    matrixA = readMatrix(matrixAInputs, "A");
    matrixB = readMatrix(matrixBInputs, "B");

    const { rowsA, colsA, colsB } = dimensions;
    const operation = operationInput.value;

    if (operation === "add") {
      matrixHasil = matrixA.map((row, i) =>
        row.map((value, j) => value + matrixB[i][j])
      );
    } else if (operation === "subtract") {
      matrixHasil = matrixA.map((row, i) =>
        row.map((value, j) => value - matrixB[i][j])
      );
    } else {
      // Perkalian matriks: hasil[i][j] = jumlah A[i][k] * B[k][j]
      matrixHasil = [];

      for (let i = 0; i < rowsA; i++) {
        const rowHasil = [];

        for (let j = 0; j < colsB; j++) {
          let total = 0;

          for (let k = 0; k < colsA; k++) {
            total += matrixA[i][k] * matrixB[k][j];
          }

          rowHasil.push(total);
        }

        matrixHasil.push(rowHasil);
      }
    }

    displayResult(matrixHasil);
    showMessage("Perhitungan berhasil!", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function displayResult(matrix) {
  resultContainer.innerHTML = "";
  resultContainer.style.gridTemplateColumns = `repeat(${matrix[0].length}, 64px)`;

  matrix.forEach(row => {
    row.forEach(value => {
      const cell = document.createElement("div");
      cell.className = "result-cell";
      cell.textContent = Number.isInteger(value) ? value : Number(value.toFixed(8));
      resultContainer.appendChild(cell);
    });
  });

  document.getElementById("sizeResult").textContent =
    `${matrix.length} × ${matrix[0].length}`;
}

createButton.addEventListener("click", createMatrices);
calculateButton.addEventListener("click", calculateMatrices);
operationInput.addEventListener("change", () => {
  updateOperator();
  calculateButton.disabled = true;
  showMessage("Operasi berubah. Klik Buat Matrix untuk memvalidasi ulang ukuran.", "");
  resultContainer.innerHTML = "";
});

[rowsAInput, colsAInput, rowsBInput, colsBInput].forEach(input => {
  input.addEventListener("input", () => {
    calculateButton.disabled = true;
    showMessage("Ukuran berubah. Klik Buat Matrix untuk membuat ulang input.", "");
  });
});

updateOperator();
