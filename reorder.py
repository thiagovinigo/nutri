import re

with open('src/features/paciente/components/QuestBoard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We'll split the content into blocks using unique strings.

# Block 1: Date Navigator (Keep at top)
date_nav_start = content.find('<div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'center\', gap: \'16px\', marginBottom: \'24px\' }}>')
date_nav_end = content.find('</div>', content.find('<button onClick={handleNextDay}')) + 6

# Block 2: Hidratação
hidra_start = content.find('<div className="patient-card patient-glass" style={{display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\', marginBottom: \'20px\', position: \'relative\', zIndex: 50}}>')
hidra_end = content.find('</div>\n\n        {/* Sleep Tracker */}')

# Block 3: Sono (Sleep Tracker)
sono_start = content.find('{/* Sleep Tracker */}')
sono_end = content.find('})()}') + 5

# Block 4: Analysis Error
err_start = content.find('{analysisError && (')
err_end = content.find(')}\n\n      <div style={{marginBottom: \'32px\'}}>')

if err_end == -1:
    err_end = content.find('</div>\n      )}', err_start) + 14

# Block 5: Extra Meals Container (Registre refeição livre + logs)
extra_start = content.find('<div style={{marginBottom: \'32px\'}}>')
extra_end = content.find('</div>\n\n      {currentRecipe ? (')

# Block 6: Performance Card
perf_start = content.find('<div className="patient-card patient-glass" style={{display: \'flex\', alignItems: \'center\', gap: \'20px\', marginBottom: \'24px\'}}>')
perf_end = content.find('</div>\n          </div>\n\n\n\n          <h2')

if perf_end == -1:
    perf_end = content.find('</div>\n          </div>', perf_start) + 22

# Block 7: Planned Meals
meals_start = content.find('<h2 style={{fontSize: \'1.2rem\', fontWeight: \'800\'')
meals_end = content.find('</>\n      ) : (\n        <div style={{textAlign: \'center\'')

if meals_end == -1:
    meals_end = content.find('</>\n      ) : (')

# Now we rebuild the return statement.
# We need to extract the exact text of each block.
date_nav_str = content[date_nav_start:date_nav_end]
hidra_str = content[hidra_start:hidra_end]
sono_str = content[sono_start:sono_end]
err_str = content[err_start:err_end]
extra_str = content[extra_start:extra_end]
perf_str = content[perf_start:perf_end]
meals_str = content[meals_start:meals_end]

# Wait, `perf_str` and `meals_str` are inside `{currentRecipe ? ( <> ... </> ) : ...}`
# So the new layout will be:

new_return = f"""    <div className="animate-pop-in">
      <input type="file" accept="image/*" ref={{fileInputRef}} style={{{{ display: 'none' }}}} onChange={{handleFileChange}} />
      
      {{showMilestone && <ShareableMilestone onClose={{() => setShowMilestone(false)}} />}}

{date_nav_str}

      {{currentRecipe && (
{perf_str}
      )}}

{err_str}

{hidra_str}

{sono_str}

      {{currentRecipe ? (
        <>
{meals_str}
        </>
      ) : (
        <div style={{{{textAlign: 'center', padding: '60px 20px', color: 'var(--patient-text-muted)'}}}}>
          <AlertCircle size={{48}} color="var(--glass-border)" style={{{{marginBottom: '16px'}}}} />
          <h3 style={{{{color: 'var(--patient-text)'}}}}>Sem Plano Ativo</h3>
          <p>O seu nutricionista ainda não liberou seu cardápio de Alta Performance.</p>
        </div>
      )}}

{extra_str}

      {{/* Modal de Sono */}}"""

# Find where the return statement starts and ends to replace it
return_start = content.find('<div className="animate-pop-in">')
return_end = content.find('{/* Modal de Sono */}')

if return_start != -1 and return_end != -1:
    new_content = content[:return_start] + new_return + content[return_end + 21:]
    with open('src/features/paciente/components/QuestBoard.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Reordered successfully!")
else:
    print("Failed to find return start or end.")
