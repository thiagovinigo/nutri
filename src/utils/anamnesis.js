export function formatAnamnesisAnswers(answers = {}, template = []) {
  return template
    .map(field => {
      const value = answers[field.id];
      if (!value) return null;
      return `${field.label}: ${value}`;
    })
    .filter(Boolean)
    .join('\n');
}
