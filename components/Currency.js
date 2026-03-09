export default function Currency({ copper }) {
  // Convert total copper to G/S/C
  const gold = Math.floor(copper / 10000);
  const silver = Math.floor((copper % 10000) / 100);
  const cp = copper % 100;

  return (
    <div className="font-mono font-bold flex gap-1">
      {gold > 0 && (
        <span className="text-yellow-500">{gold}g</span>
      )}
      {silver > 0 && (
        <span className="text-gray-400">{silver.toString().padStart(2, '0')}s</span>
      )}
      <span className="text-orange-600">{cp.toString().padStart(2, '0')}c</span>
    </div>
  );
}