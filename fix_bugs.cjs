const fs = require('fs');

// 1. Fix index.css (Restore flip-card CSS)
let css = fs.readFileSync('src/index.css', 'utf8');
if (!css.includes('.flip-card {')) {
  css += `

/* 3D Flip Card for Recipes */
.flip-card {
  background-color: transparent;
  perspective: 1000px;
  width: 100%;
}
.flip-card-inner {
  position: relative;
  width: 100%;
  text-align: left;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}
.flip-card.flipped .flip-card-inner {
  transform: rotateY(180deg);
}
.flip-card-front, .flip-card-back {
  width: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
.flip-card-back {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  transform: rotateY(180deg);
}
`;
  fs.writeFileSync('src/index.css', css, 'utf8');
  console.log('Restored flip-card CSS in index.css');
}

// 2. Fix QuestBoard.jsx (Reset state on date change)
let questBoard = fs.readFileSync('src/features/paciente/components/QuestBoard.jsx', 'utf8');
if (!questBoard.includes('useEffect(() => {\n    setCheckInMealIndex(null);')) {
  const target = `  const openCheckIn = (idx) => {`;
  const insert = `  useEffect(() => {
    setCheckInMealIndex(null);
    setAteOnTime(null);
    setFollowedDiet(null);
    setDivergenceText('');
  }, [selectedDateFormatted]);

  const openCheckIn = (idx) => {`;
  
  questBoard = questBoard.replace(target, insert);
  fs.writeFileSync('src/features/paciente/components/QuestBoard.jsx', questBoard, 'utf8');
  console.log('Fixed QuestBoard.jsx state leak on date change');
}

// 3. Fix AppContext.jsx activePatient leak on bypassLogin
let context = fs.readFileSync('src/context/AppContext.jsx', 'utf8');
const rxBypass = /const bypassLogin = \(role, patientObj = null\) => \{[\s\S]*?setUserRole\(role\);/;
if (rxBypass.test(context)) {
  const match = context.match(rxBypass)[0];
  if (!match.includes('setActivePatient(null)')) {
    const newBypass = match.replace('setUserRole(role);', 'setUserRole(role);\n    setActivePatient(null);');
    context = context.replace(match, newBypass);
    fs.writeFileSync('src/context/AppContext.jsx', context, 'utf8');
    console.log('Fixed AppContext.jsx bypassLogin activePatient leak');
  }
}

const rxLogout = /const logout = \(\) => \{[\s\S]*?setUserRole\(null\);/;
if (rxLogout.test(context)) {
  const match = context.match(rxLogout)[0];
  if (!match.includes('setActivePatient(null)')) {
    const newLogout = match.replace('setUserRole(null);', 'setUserRole(null);\n    setActivePatient(null);');
    context = context.replace(match, newLogout);
    fs.writeFileSync('src/context/AppContext.jsx', context, 'utf8');
    console.log('Fixed AppContext.jsx logout activePatient leak');
  }
}
