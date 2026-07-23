const fs = require('fs');

const path = 'src/features/paciente/components/QuestBoard.jsx';
let content = fs.readFileSync(path, 'utf8');

// We want to replace the whole return statement of QuestBoard with a new structured one.
// Let's grab the blocks by using string splitting/substring.

function getBlock(startStr, endStr) {
    const start = content.indexOf(startStr);
    if (start === -1) throw new Error(`Could not find start: ${startStr}`);
    
    // Some blocks end before a specific string, so endStr is what follows it
    const end = content.indexOf(endStr, start);
    if (end === -1) throw new Error(`Could not find end: ${endStr}`);
    
    return content.substring(start, end);
}

const dateNav = getBlock(
    "<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>",
    "      <div className=\"patient-card patient-glass\" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative', zIndex: 50}}>"
);

const hidraAndSleepAndErrorAndExtra = getBlock(
    "      <div className=\"patient-card patient-glass\" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative', zIndex: 50}}>",
    "      {currentRecipe ? ("
);

// We need to split out the Performance Card from the rest of the currentRecipe block.
const perfCard = getBlock(
    "          <div className=\"patient-card patient-glass\" style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px'}}>\n            <div style={{position: 'relative', width: '100px', height: '100px'}}>\n              <svg width=\"100\" height=\"100\" style={{transform: 'rotate(-90deg)'}}>\n                <circle cx=\"50\" cy=\"50\" r={radius} stroke=\"rgba(0,0,0,0.05)\" strokeWidth=\"8\" fill=\"none\" />\n                <circle cx=\"50\" cy=\"50\" r={radius} stroke=\"var(--primary-color)\" strokeWidth=\"8\" fill=\"none\" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{transition: 'stroke-dashoffset 1s ease-in-out', strokeLinecap: 'round'}} />\n              </svg>",
    "          <h2 style={{fontSize: '1.2rem'"
);
// We also replace "Performance" with "Performance Diária" inside perfCard
const newPerfCard = perfCard.replace(
    "<h3 style={{margin: '0 0 4px 0', fontSize: '1.3rem', color: 'var(--patient-text)'}}>Performance</h3>",
    "<h3 style={{margin: '0 0 4px 0', fontSize: '1.3rem', color: 'var(--patient-text)'}}>Performance Diária</h3>"
);

const mealsHeaderAndList = getBlock(
    "          <h2 style={{fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px'",
    "        </>\n      ) : ("
);

// Reconstruct
const newReturn = `
    <div className="animate-pop-in">
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
      
      {showMilestone && <ShareableMilestone onClose={() => setShowMilestone(false)} />}

      ${dateNav.trim()}

      {currentRecipe && (
        <>
${newPerfCard}
        </>
      )}

${hidraAndSleepAndErrorAndExtra}

      {currentRecipe ? (
        <>
${mealsHeaderAndList}
        </>
      ) : (
`;

// Replace from `<div className="animate-pop-in">` to `) : (` for the false branch of currentRecipe
const startReplace = content.indexOf('<div className="animate-pop-in">');
const endReplace = content.indexOf('        </>\n      ) : (\n        <div style={{textAlign: \'center\'') + 26;

const finalContent = content.substring(0, startReplace) + newReturn.trim() + "\n        " + content.substring(endReplace);

fs.writeFileSync(path, finalContent, 'utf8');
console.log('Reordered using node!');
