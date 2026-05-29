import { useState, useEffect } from 'react';
import { CHECKLIST_ITEMS } from './checklistConstants';

export default function RevisionChecklist({ revisionId }) {
  const storageKey = `checklist_revision_${revisionId}`;
  const [checkedItems, setCheckedItems] = useState({});
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setCheckedItems(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing checklist from localStorage', e);
      }
    }
  }, [storageKey]);

  const toggleItem = (grupo, item) => {
    const key = `${grupo}-${item}`;
    const newState = { ...checkedItems, [key]: !checkedItems[key] };
    setCheckedItems(newState);
    localStorage.setItem(storageKey, JSON.stringify(newState));
  };

  const totalItems = CHECKLIST_ITEMS.reduce((acc, curr) => acc + curr.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = totalItems === 0 ? 0 : Math.round((checkedCount / totalItems) * 100);

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4">
      <div 
        className="flex items-center justify-between mb-3 cursor-pointer select-none group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-amber-400 group-hover:text-amber-300 transition-colors">
            Checklist de Inspección
          </h2>
          <p className="text-xs font-mono text-zinc-500 mt-1">
            {checkedCount} de {totalItems} revisados ({progress}%)
          </p>
        </div>
        <div className="text-zinc-500 group-hover:text-amber-400 transition-colors font-mono text-xl">
          {isExpanded ? '−' : '+'}
        </div>
      </div>
      
      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-4">
        <div 
          className="bg-amber-500 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-2 border-t border-zinc-800">
          {CHECKLIST_ITEMS.map((cat) => (
            <div key={cat.grupo} className="border border-zinc-800 p-3 bg-zinc-900/50">
              <h3 className="text-xs font-mono font-bold text-zinc-400 mb-3 uppercase tracking-wide">
                {cat.grupo}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {cat.items.map((item) => {
                  const key = `${cat.grupo}-${item}`;
                  const isChecked = !!checkedItems[key];
                  return (
                    <label 
                      key={item} 
                      className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-zinc-800/50 transition-colors rounded"
                    >
                      <div className={`w-5 h-5 border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-amber-500 border-amber-500' : 'border-zinc-600 group-hover:border-amber-400'}`}>
                        {isChecked && <span className="text-black text-xs font-bold">✓</span>}
                      </div>
                      <span className={`text-sm font-mono transition-colors ${isChecked ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                        {item}
                      </span>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={isChecked}
                        onChange={() => toggleItem(cat.grupo, item)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
