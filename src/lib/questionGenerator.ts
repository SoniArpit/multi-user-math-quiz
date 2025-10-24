export type MathQuestion = {
  question: string;
  answer: number;
};

export function generateMathQuestion(): MathQuestion {
  const operations = ["+", "-", "*", "/"];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  switch (operation) {
    case "+":
      const a1 = Math.floor(Math.random() * 50) + 1;
      const b1 = Math.floor(Math.random() * 50) + 1;
      return { question: `${a1} + ${b1}`, answer: a1 + b1 };

    case "-":
      const a2 = Math.floor(Math.random() * 50) + 25;
      const b2 = Math.floor(Math.random() * 25) + 1;
      return { question: `${a2} - ${b2}`, answer: a2 - b2 };

    case "*":
      const a3 = Math.floor(Math.random() * 12) + 1;
      const b3 = Math.floor(Math.random() * 12) + 1;
      return { question: `${a3} × ${b3}`, answer: a3 * b3 };

    case "/":
      const b4 = Math.floor(Math.random() * 10) + 2;
      const ans = Math.floor(Math.random() * 10) + 1;
      const a4 = b4 * ans;
      return { question: `${a4} ÷ ${b4}`, answer: ans };

    default:
      return { question: "5 + 3", answer: 8 };
  }
}
