async function loadData() {
  const gradesRes = await fetch("/comic-grading-gpt/data/grades.json");
  const spineRes  = await fetch("/comic-grading-gpt/data/spine_rules.json");

  const grades = await gradesRes.json();
  const spineRules = await spineRes.json();
  return { grades, spineRules };
}

function pickGrade(grades, score) {
  let best = grades[grades.length - 1];
  for (const g of grades) {
    if (score >= g.score && g.score >= best.score) {
      best = g;
    }
  }
  return best;
}

document.addEventListener("DOMContentLoaded", async () => {
  const { grades, spineRules } = await loadData();

  const form = document.getElementById("spine-form");
  const resultDiv = document.getElementById("result");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const chosen = form.elements["spine"].value;
    const rule = spineRules.find(r => r.id === chosen);

    if (!rule) {
      resultDiv.innerHTML = "<p>Something went wrong – rule not found.</p>";
      return;
    }

    const baseScore = 10.0;
    const rawScore = baseScore - (rule.deduction || 0);
    const finalScore = Math.min(rule.max_score, rawScore);

    const grade = pickGrade(grades, finalScore);

    resultDiv.innerHTML = `
      <h2>Estimated Spine Grade</h2>
      <p><strong>${grade.short}</strong> (${grade.label})</p>
      <p><em>Rule applied:</em> ${rule.description}</p>
      <p><small>Score: ${finalScore.toFixed(1)}</small></p>
    `;
  });
});
