'use client';

import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [garmentType, setGarmentType] = useState<'tee' | 'hoodie'>('tee');

  if (!isOpen) return null;

  const teeSizes = [
    { size: 'S', chestIn: '18"', lengthIn: '28"', sleeveIn: '8.25"', chestCm: '46 cm', lengthCm: '71 cm', sleeveCm: '21 cm' },
    { size: 'M', chestIn: '20"', lengthIn: '29"', sleeveIn: '8.6"', chestCm: '51 cm', lengthCm: '74 cm', sleeveCm: '22 cm' },
    { size: 'L', chestIn: '22"', lengthIn: '30"', sleeveIn: '9.1"', chestCm: '56 cm', lengthCm: '76 cm', sleeveCm: '23 cm' },
    { size: 'XL', chestIn: '24"', lengthIn: '31"', sleeveIn: '9.6"', chestCm: '61 cm', lengthCm: '79 cm', sleeveCm: '24 cm' },
    { size: '2XL', chestIn: '26"', lengthIn: '32"', sleeveIn: '10.2"', chestCm: '66 cm', lengthCm: '81 cm', sleeveCm: '26 cm' },
  ];

  const hoodieSizes = [
    { size: 'S', chestIn: '20"', lengthIn: '27"', sleeveIn: '33.5"', chestCm: '51 cm', lengthCm: '69 cm', sleeveCm: '85 cm' },
    { size: 'M', chestIn: '22"', lengthIn: '28"', sleeveIn: '34.5"', chestCm: '56 cm', lengthCm: '71 cm', sleeveCm: '88 cm' },
    { size: 'L', chestIn: '24"', lengthIn: '29"', sleeveIn: '35.5"', chestCm: '61 cm', lengthCm: '74 cm', sleeveCm: '90 cm' },
    { size: 'XL', chestIn: '26"', lengthIn: '30"', sleeveIn: '36.5"', chestCm: '66 cm', lengthCm: '76 cm', sleeveCm: '93 cm' },
    { size: '2XL', chestIn: '28"', lengthIn: '31"', sleeveIn: '37.5"', chestCm: '71 cm', lengthCm: '79 cm', sleeveCm: '95 cm' },
  ];

  const currentSizes = garmentType === 'tee' ? teeSizes : hoodieSizes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-aerospace-900 border border-aerospace-700 rounded-xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-aerospace-800 pb-4">
          <div className="flex items-center space-x-3">
            <Ruler className="w-5 h-5 text-avionics-cyan" />
            <div>
              <h3 className="text-base font-mono font-bold text-slate-100 tracking-wider">
                AEROSPACE SIZING SPECIFICATION
              </h3>
              <p className="text-xs text-slate-400">Precision dimensions and anatomical tolerances</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-aerospace-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggles */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 text-xs font-mono">
          {/* Garment Selector */}
          <div className="flex rounded-md bg-aerospace-950 p-1 border border-aerospace-800">
            <button
              onClick={() => setGarmentType('tee')}
              className={`px-4 py-1.5 rounded transition ${
                garmentType === 'tee' ? 'bg-aerospace-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              T-SHIRTS (BELLA+CANVAS 3001)
            </button>
            <button
              onClick={() => setGarmentType('hoodie')}
              className={`px-4 py-1.5 rounded transition ${
                garmentType === 'hoodie' ? 'bg-aerospace-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              HOODIES (GILDAN 18500)
            </button>
          </div>

          {/* Unit Selector */}
          <div className="flex rounded-md bg-aerospace-950 p-1 border border-aerospace-800 self-start sm:self-auto">
            <button
              onClick={() => setUnit('inches')}
              className={`px-3 py-1.5 rounded transition ${
                unit === 'inches' ? 'bg-afterburner text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              INCHES
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1.5 rounded transition ${
                unit === 'cm' ? 'bg-afterburner text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CM
            </button>
          </div>
        </div>

        {/* Dimension Table */}
        <div className="overflow-x-auto border border-aerospace-800 rounded-lg">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-aerospace-950/80 text-slate-300 border-b border-aerospace-800">
              <tr>
                <th className="py-3 px-4">SIZE</th>
                <th className="py-3 px-4">CHEST WIDTH</th>
                <th className="py-3 px-4">BODY LENGTH</th>
                <th className="py-3 px-4">SLEEVE LENGTH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aerospace-800/60 text-slate-200">
              {currentSizes.map((row) => (
                <tr key={row.size} className="hover:bg-aerospace-800/40 transition">
                  <td className="py-3 px-4 font-bold text-avionics-cyan">{row.size}</td>
                  <td className="py-3 px-4">{unit === 'inches' ? row.chestIn : row.chestCm}</td>
                  <td className="py-3 px-4">{unit === 'inches' ? row.lengthIn : row.lengthCm}</td>
                  <td className="py-3 px-4">{unit === 'inches' ? row.sleeveIn : row.sleeveCm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Measurement Notes */}
        <div className="bg-aerospace-950/60 border border-aerospace-800 rounded-lg p-4 text-xs font-mono text-slate-400 space-y-1.5">
          <div className="text-slate-200 font-bold">CALIBRATION NOTES:</div>
          <div>• Chest Width: Measured 1 inch below armhole, laid flat across the chest.</div>
          <div>• Body Length: Measured from the highest point of shoulder to the bottom hem.</div>
          <div>• Tolerance: Manufacturing variance allowable within ±0.75 in (1.9 cm).</div>
          <div>• Substrate Pre-shrunk: Retains 98%+ profile structure after cold wash cycle.</div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-aerospace-800 hover:bg-aerospace-700 text-xs font-mono tracking-wider text-slate-200 rounded border border-aerospace-700 transition"
          >
            CONFIRM & RETURN TO FLIGHT APPAREL
          </button>
        </div>
      </div>
    </div>
  );
}
