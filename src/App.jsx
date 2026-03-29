import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import "./App.css";

const concepts = [
  {
    name: "Fourier Series",
    input: "Periodic continuous-time signal",
    output: "Discrete harmonics / coefficients",
    spectrum: "Line spectrum",
    use: "Representing a repeating continuous-time signal as a sum of harmonics",
    misconception: "It works directly for any finite non-periodic signal",
    key: "Best for signals that repeat forever in time.",
  },
  {
    name: "Fourier Transform",
    input: "Aperiodic continuous-time signal",
    output: "Continuous frequency spectrum",
    spectrum: "Continuous",
    use: "Analyzing non-periodic continuous-time signals",
    misconception: "It is the same thing as the DFT",
    key: "Best for ideal continuous-time, non-periodic analysis.",
  },
  {
    name: "DTFT",
    input: "Infinite discrete-time signal",
    output: "Continuous, periodic frequency response",
    spectrum: "Continuous and periodic",
    use: "Theoretical analysis of discrete-time signals",
    misconception: "Its output is a finite set of bins",
    key: "Discrete in time does not imply discrete in frequency.",
  },
  {
    name: "DFT",
    input: "Finite discrete sequence",
    output: "Discrete frequency bins",
    spectrum: "Discrete",
    use: "Computing spectra of finite sampled data on a computer",
    misconception: "It is identical to the continuous Fourier Transform",
    key: "This is the practical model for real digital data.",
  },
  {
    name: "FFT",
    input: "Same input as DFT",
    output: "Same output as DFT",
    spectrum: "Same as DFT",
    use: "Efficient computation of the DFT",
    misconception: "FFT is a different transform from DFT",
    key: "FFT is an algorithm, not a new transform.",
  },
];

function generateSignal(type, N, cycles, secondCycles, mix, phase) {
  const arr = [];
  for (let n = 0; n < N; n++) {
    const t = n / N;
    let y = 0;

    if (type === "sine") {
      y = Math.sin(2 * Math.PI * cycles * t + phase);
    } else if (type === "two-tone") {
      y =
        Math.sin(2 * Math.PI * cycles * t) +
        mix * Math.sin(2 * Math.PI * secondCycles * t + phase);
    } else if (type === "square") {
      y = Math.sin(2 * Math.PI * cycles * t) >= 0 ? 1 : -1;
    } else if (type === "pulse") {
      y = n > N * 0.35 && n < N * 0.55 ? 1 : 0;
    } else if (type === "off-bin") {
      y = Math.sin(2 * Math.PI * (cycles + 0.5) * t);
    }

    arr.push({ n, value: y });
  }
  return arr;
}

function computeDFTMagnitude(signal) {
  const N = signal.length;
  const out = [];
  for (let k = 0; k < N; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n++) {
      const x = signal[n].value;
      const angle = (-2 * Math.PI * k * n) / N;
      re += x * Math.cos(angle);
      im += x * Math.sin(angle);
    }
    const mag = Math.sqrt(re * re + im * im) / N;
    out.push({ k, magnitude: Number(mag.toFixed(3)) });
  }
  return out.slice(0, Math.floor(N / 2));
}

function getSignalExplanation(type) {
  switch (type) {
    case "sine":
      return "A sinusoid is periodic. In theory, Fourier Series is natural for the repeating version. In practice, if we keep only N samples, we compute a DFT.";
    case "two-tone":
      return "This signal contains two frequency components. The DFT should show two dominant peaks when the frequencies align reasonably with the sample window.";
    case "square":
      return "A square wave has many harmonics. Fourier Series explains this using odd harmonics, while the DFT shows sampled harmonic peaks.";
    case "pulse":
      return "A pulse is not naturally periodic, so it contrasts well with Fourier Series and motivates the Fourier Transform viewpoint.";
    case "off-bin":
      return "The sinusoid does not align with an exact DFT bin, so its energy spreads into neighboring bins. This is spectral leakage.";
    default:
      return "";
  }
}

const quizBank = [
  {
    question:
      "A finite-length audio clip sampled from a microphone is best analyzed directly with which tool?",
    options: ["Fourier Series", "DTFT", "DFT", "FFT only"],
    answer: 2,
    explanation:
      "A real audio clip is finite and discrete, so the DFT is the correct mathematical model. The FFT is just the fast way to compute it.",
  },
  {
    question: "What is the relationship between FFT and DFT?",
    options: [
      "They are different transforms",
      "FFT approximates the DFT",
      "FFT computes the DFT efficiently",
      "DFT computes the FFT efficiently",
    ],
    answer: 2,
    explanation:
      "FFT is an algorithm for computing the exact same DFT values more efficiently.",
  },
  {
    question:
      "Which representation is most natural for a continuous-time periodic square wave?",
    options: ["Fourier Series", "DFT", "FFT", "DTFT"],
    answer: 0,
    explanation:
      "Fourier Series is the standard representation for periodic continuous-time signals.",
  },
  {
    question:
      "Which object has a continuous and periodic frequency-domain representation?",
    options: ["Fourier Series", "DTFT", "DFT", "FFT"],
    answer: 1,
    explanation:
      "The DTFT is continuous in frequency and periodic because the signal is discrete in time.",
  },
  {
    question: "Why is the DFT used so often in practice?",
    options: [
      "Because real digital data is finite and sampled",
      "Because it only works for analog signals",
      "Because it is more continuous than the FT",
      "Because it avoids all approximation issues",
    ],
    answer: 0,
    explanation:
      "Computers store finite sequences of samples, which is exactly the setting of the DFT.",
  },
  {
    question:
      "If a sinusoid does not align exactly with a DFT bin, what commonly happens?",
    options: [
      "The signal disappears",
      "Its energy spreads into nearby bins",
      "The FFT becomes random",
      "It becomes periodic in amplitude",
    ],
    answer: 1,
    explanation:
      "This is spectral leakage, caused by finite observation of a frequency that is off-bin.",
  },
  {
    question: "Which statement about FFT is correct?",
    options: [
      "It changes the definition of the frequency bins",
      "It gives a different spectrum than the DFT",
      "It is a faster way to compute the same DFT result",
      "It only works for continuous-time signals",
    ],
    answer: 2,
    explanation:
      "FFT changes efficiency, not the mathematical meaning of the result.",
  },
  {
    question:
      "A single non-periodic pulse is most naturally associated with which continuous-time concept?",
    options: ["Fourier Series", "Fourier Transform", "FFT", "DFT"],
    answer: 1,
    explanation:
      "A non-periodic continuous-time signal is the natural setting for the Fourier Transform.",
  },
  {
    question:
      "What is the biggest conceptual difference between Fourier Series and DFT?",
    options: [
      "Fourier Series is for periodic continuous-time signals, while DFT is for finite discrete sequences",
      "DFT is only for square waves",
      "Fourier Series is always faster than FFT",
      "They assume identical input models",
    ],
    answer: 0,
    explanation:
      "They belong to different signal models: ideal repeating continuous-time signals versus finite sampled discrete data.",
  },
  {
    question:
      "Why can FFT and DFT be listed separately in a learning tool even though they give the same result?",
    options: [
      "Because one is a transform and the other is an algorithm",
      "Because they only differ for small N",
      "Because FFT is continuous and DFT is discrete",
      "Because DFT is outdated",
    ],
    answer: 0,
    explanation:
      "Students often confuse the transform itself with the algorithm used to compute it, so it is useful to separate them conceptually.",
  },
];

export default function App() {
  const [tab, setTab] = useState("compare");
  const [signalType, setSignalType] = useState("sine");
  const [N, setN] = useState(32);
  const [cycles, setCycles] = useState(4);
  const [secondCycles, setSecondCycles] = useState(7);
  const [mix, setMix] = useState(0.6);
  const [phase, setPhase] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const signal = useMemo(
    () => generateSignal(signalType, N, cycles, secondCycles, mix, phase),
    [signalType, N, cycles, secondCycles, mix, phase]
  );

  const dft = useMemo(() => computeDFTMagnitude(signal), [signal]);
  const quiz = quizBank[quizIndex];
  const explanation = getSignalExplanation(signalType);

  const submitAnswer = (idx) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    if (idx === quiz.answer) {
      setScore((s) => s + 1);
    }
  };

  const nextQuiz = () => {
    setSelected(null);
    setRevealed(false);
    setQuizIndex((i) => (i + 1) % quizBank.length);
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
  };

  return (
    <div className="app">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero"
      >
        <h1>Fourier Concepts, Side by Side</h1>
        <p>
          Compare Fourier Series, Fourier Transform, DTFT, DFT, and FFT through
          an interactive concept table, signal playground, and quiz for
          undergraduate computing students.
        </p>
      </motion.div>

      <div className="tabs">
        <button onClick={() => setTab("compare")}>Compare</button>
        <button onClick={() => setTab("playground")}>Playground</button>
        <button onClick={() => setTab("quiz")}>Quiz</button>
      </div>

      {tab === "compare" && (
        <div className="card">
          <h2>Concept comparison</h2>
          <p className="subtitle">
            Compare the assumptions, outputs, and common misconceptions for each
            Fourier concept.
          </p>

          <div className="table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Concept</th>
                  <th>Input</th>
                  <th>Output</th>
                  <th>Spectrum</th>
                  <th>Typical use</th>
                  <th>Common misconception</th>
                  <th>Key idea</th>
                </tr>
              </thead>
              <tbody>
                {concepts.map((concept) => (
                  <tr key={concept.name}>
                    <td><strong>{concept.name}</strong></td>
                    <td>{concept.input}</td>
                    <td>{concept.output}</td>
                    <td>{concept.spectrum}</td>
                    <td>{concept.use}</td>
                    <td>{concept.misconception}</td>
                    <td>{concept.key}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "playground" && (
        <div className="playground">
          <div className="controls card">
            <h2>Signal controls</h2>

            <label>Signal type</label>
            <select value={signalType} onChange={(e) => setSignalType(e.target.value)}>
              <option value="sine">Sine</option>
              <option value="two-tone">Two-tone</option>
              <option value="square">Square</option>
              <option value="pulse">Pulse</option>
              <option value="off-bin">Off-bin sine</option>
            </select>

            <label>Sample count N: {N}</label>
            <input
              type="range"
              min="16"
              max="64"
              step="8"
              value={N}
              onChange={(e) => setN(Number(e.target.value))}
            />

            <label>Primary frequency: {cycles}</label>
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={cycles}
              onChange={(e) => setCycles(Number(e.target.value))}
            />

            <label>Second frequency: {secondCycles}</label>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={secondCycles}
              onChange={(e) => setSecondCycles(Number(e.target.value))}
            />

            <label>Second tone amplitude: {mix.toFixed(1)}</label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={mix}
              onChange={(e) => setMix(Number(e.target.value))}
            />

            <label>Phase shift: {phase.toFixed(2)} rad</label>
            <input
              type="range"
              min="0"
              max="6.28"
              step="0.1"
              value={phase}
              onChange={(e) => setPhase(Number(e.target.value))}
            />

            <div className="info-box">
              <strong>What this shows:</strong>
              <div>{explanation}</div>
            </div>
          </div>

          <div className="charts">
            <div className="card chart-card">
              <h2>Time-domain signal</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={signal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="n" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card chart-card">
              <h2>DFT magnitude spectrum</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dft}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="k" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="magnitude" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "quiz" && (
        <div className="card quiz-card">
          <h2>Check your understanding</h2>
          <p><strong>Question:</strong> {quizIndex + 1} / {quizBank.length}</p>
          <p><strong>Score:</strong> {score}</p>

          <p className="question">{quiz.question}</p>

          <div className="quiz-options">
            {quiz.options.map((opt, idx) => {
              const correct = revealed && idx === quiz.answer;
              const wrong = revealed && idx === selected && idx !== quiz.answer;

              return (
                <button
                  key={idx}
                  className={`quiz-option ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}
                  onClick={() => submitAnswer(idx)}
                >
                  <span>{opt}</span>
                  {correct && <CheckCircle2 size={18} />}
                  {wrong && <XCircle size={18} />}
                </button>
              );
            })}
          </div>

          {revealed && (
            <div className="explanation">
              <strong>Explanation:</strong> {quiz.explanation}
            </div>
          )}

          <div className="quiz-actions">
            <button className="next-btn" onClick={nextQuiz}>
              Next question
            </button>
            <button className="secondary-btn" onClick={resetQuiz}>
              Reset quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}