'use client';

import React, { useState } from 'react';
import { Ruler, Sparkles, CheckCircle2 } from 'lucide-react';

export default function DedicatedSizeGuidePage() {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-12">
      <div className="border-b border-aerospace-800 pb-6 space-y-2">
        <span className="text-xs font-mono text-avionics-cyan uppercase tracking-widest">
          STANDARDIZED DIMENSIONS
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-sans tracking-tight">
          AEROSPACE SIZING & FIT CALIBRATION
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
          Carefully review garment specifications prior to ordering. All measurements adhere to standard manufacturing tolerances.
        </p>
      </div>

      {/* Unit Toggle */}
      <div className="flex justify-end">
        <div className="flex rounded-lg bg-aerospace-900 p-1 border border-aerospace-800 text-xs font-mono">
          <button
            onClick={() => setUnit('inches')}
            className={`px-4 py-1.5 rounded transition ${
              unit === 'inches' ? 'bg-afterburner text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            INCHES
          </button>
          <button
            onClick={() => setUnit('cm')}
            className={`px-4 py-1.5 rounded transition ${
              unit === 'cm' ? 'bg-afterburner text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            CENTIMETERS (CM)
          </button>
        </div>
      </div>

      {/* T-Shirt Table */}
      <div className="bg-aerospace-900 border border-aerospace-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex justify-between items-center border-b border-aerospace-800 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-base font-mono font-bold text-slate-100">
              BELLA+CANVAS 3001 UNISEX TEE
            </h2>
            <p className="text-xs font-mono text-slate-400">100% Airlume Combed Cotton // 142 GSM</p>
          </div>
          <span className="text-xs font-mono text-avionics-cyan border border-avionics-cyan/30 px-2.5 py-1 rounded bg-aerospace-950">
            MODERN RETAIL FIT
          </span>
        </div>

        <div className="overflow-x-auto border border-aerospace-800 rounded-xl">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-aerospace-950 text-slate-400 border-b border-aerospace-800">
              <tr>
                <th className="py-3 px-4">SIZE</th>
                <th className="py-3 px-4">CHEST WIDTH</th>
                <th className="py-3 px-4">BODY LENGTH</th>
                <th className="py-3 px-4">SLEEVE LENGTH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aerospace-800/60 text-slate-200">
              {teeSizes.map((row) => (
                <tr key={row.size} className="hover:bg-aerospace-800/40">
                  <td className="py-3 px-4 font-bold text-avionics-cyan">{row.size}</td>
                  <td className="py-3 px-4">{unit === 'inches' ? row.chestIn : row.chestCm}</td>
                  <td className="py-3 px-4">{unit === 'inches' ? row.lengthIn : row.lengthCm}</td>
                  <td className="py-3 px-4">{unit === 'inches' ? row.sleeveIn : row.sleeveCm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hoodie Table */}
      <div className="bg-aerospace-900 border border-aerospace-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex justify-between items-center border-b border-aerospace-800 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-base font-mono font-bold text-slate-100">
              GILDAN 18500 HEAVYWEIGHT FLEECE HOODIE
            </h2>
            <p className="text-xs font-mono text-slate-400">50% Preshrunk Cotton / 50% Polyester // 271 GSM</p>
          </div>
          <span className="text-xs font-mono text-avionics-amber border border-avionics-amber/30 px-2.5 py-1 rounded bg-aerospace-950">
            CLASSIC STREETWEAR FIT
          </span>
        </div>

        <div className="overflow-x-auto border border-aerospace-800 rounded-xl">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-aerospace-950 text-slate-400 border-b border-aerospace-800">
              <tr>
                <th className="py-3 px-4">SIZE</th>
                <th className="py-3 px-4">CHEST WIDTH</th>
                <th className="py-3 px-4">BODY LENGTH</th>
                <th className="py-3 px-4">SLEEVE LENGTH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aerospace-800/60 text-slate-200">
              {hoodieSizes.map((row) => (
                <tr key={row.size} className="hover:bg-aerospace-800/40">
                  <td className="py-3 px-4 font-bold text-avionics-amber">{row.size}</td>
                  <td className="py-3 px-4">{unit === 'inches' ? row.chestIn : row.chestCm}</td>
                  <td className="py-3 px-4">{unit === 'inches' ? row.lengthIn : row.lengthCm}</td>
                  <td className="py-3 px-4">{unit === 'inches' ? row.sleeveIn : row.sleeveCm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Measurement Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono text-slate-300">
        <div className="p-6 bg-aerospace-900 border border-aerospace-800 rounded-xl space-y-2">
          <div className="text-slate-100 font-bold uppercase tracking-wider">CHEST MEASUREMENT</div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Lay your favorite well-fitting tee or hoodie flat on a surface. Measure directly across the chest from armpit to armpit seam. Double the number if comparing to around-the-body chest circumference.
          </p>
        </div>

        <div className="p-6 bg-aerospace-900 border border-aerospace-800 rounded-xl space-y-2">
          <div className="text-slate-100 font-bold uppercase tracking-wider">LENGTH MEASUREMENT</div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Measure from the highest point of the shoulder (where the collar meets the shoulder seam) straight down to the bottom hem of the shirt or hoodie.
          </p>
        </div>
      </div>
    </div>
  );
}
