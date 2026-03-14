import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function App() {
  const [inputs, setInputs] = useState({
    currentSavings: 0,
    monthlySavings: 0,
    monthlyReturn: 0,
    housePrice: 0,
    annualRealEstateGrowth: 0,
  })

  const [results, setResults] = useState(null)

  const loadExample = () => {
    setInputs({
      currentSavings: 300000,
      monthlySavings: 20000,
      monthlyReturn: 1.5,
      housePrice: 4000000,
      annualRealEstateGrowth: 15
    })
  }

  const handleChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: parseFloat(e.target.value) || 0
    })
  }

  const calculate = () => {
    const tapuMasrafi = inputs.housePrice * 0.04 // %4 tapu masrafı
    const totalRequired = inputs.housePrice + tapuMasrafi

    let currentSavings = inputs.currentSavings
    let currentHousePrice = inputs.housePrice
    const data = []
    let month = 0
    const maxMonths = 480 // 40 yıl max

    while (currentSavings < totalRequired && month < maxMonths) {
      // Aylık faiz (mevcut birikim üzerine)
      currentSavings = currentSavings * (1 + inputs.monthlyReturn / 100) + inputs.monthlySavings

      // Aylık emlak artışı (yıllık / 12)
      const monthlyHouseGrowth = inputs.annualRealEstateGrowth / 12 / 100
      currentHousePrice = currentHousePrice * (1 + monthlyHouseGrowth)

      // Her yıl bir veri noktası kaydet
      if (month % 12 === 0 && month > 0) {
        data.push({
          year: month / 12,
          savings: Math.round(currentSavings),
          housePrice: Math.round(currentHousePrice),
          totalRequired: Math.round(currentHousePrice + tapuMasrafi)
        })
      }

      month++
    }

    // Son durumu da ekle
    if (month > 0) {
      const finalTapu = currentHousePrice * 0.04
      data.push({
        year: (month / 12).toFixed(1),
        savings: Math.round(currentSavings),
        housePrice: Math.round(currentHousePrice),
        totalRequired: Math.round(currentHousePrice + finalTapu)
      })
    }

    const canAfford = currentSavings >= (currentHousePrice + (currentHousePrice * 0.04))

    const years = Math.floor(month / 12)
    const months = month % 12

    setResults({
      months,
      years,
      monthsRemaining: months,
      finalSavings: Math.round(currentSavings),
      finalHousePrice: Math.round(currentHousePrice),
      finalTapu: Math.round(currentHousePrice * 0.04),
      finalTotal: Math.round(currentHousePrice + (currentHousePrice * 0.04)),
      tapuMasrafi: Math.round(tapuMasrafi),
      totalRequired: Math.round(totalRequired),
      data,
      canAfford
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-4xl font-bold text-orange-600 mb-4 sm:mb-8 text-center">
          🏠 Ev Alım Planlayıcı
        </h1>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-orange-700 mb-4 sm:mb-6">Bilgileri Gir</h2>

            <div className="space-y-3 sm:space-y-4">
              <button
                onClick={loadExample}
                className="w-full bg-orange-200 hover:bg-orange-300 text-orange-800 font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
              >
                📝 Örnek Veriler Yükle
              </button>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Mevcut Birikim (TL)
                </label>
                <input
                  type="number"
                  name="currentSavings"
                  value={inputs.currentSavings}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Örn: 500000"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Aylık Birikim (TL)
                </label>
                <input
                  type="number"
                  name="monthlySavings"
                  value={inputs.monthlySavings}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Örn: 15000"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Aylık Yatırım Getirisi (%)
                </label>
                <input
                  type="number"
                  name="monthlyReturn"
                  value={inputs.monthlyReturn}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Örn: 1.5"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Evin Şu Anki Fiyatı (TL)
                </label>
                <input
                  type="number"
                  name="housePrice"
                  value={inputs.housePrice}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Örn: 3000000"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Yıllık Emlak Artışı (%)
                </label>
                <input
                  type="number"
                  name="annualRealEstateGrowth"
                  value={inputs.annualRealEstateGrowth}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Örn: 15"
                />
              </div>

              <button
                onClick={calculate}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm sm:text-base"
              >
                Hesapla
              </button>
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-orange-700 mb-4 sm:mb-6">Sonuçlar</h2>

              <div className="space-y-3 sm:space-y-4">
                {results.canAfford ? (
                  <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                    <p className="text-base sm:text-lg font-semibold text-green-800">
                      🎉 Evi {results.years} yıl {results.monthsRemaining} ay sonra alabilirsin!
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 rounded-lg p-3 sm:p-4">
                    <p className="text-base sm:text-lg font-semibold text-red-800">
                      😔 Bu koşullarda 40 yıl içinde evi alamazsın.
                    </p>
                    <p className="text-xs sm:text-sm text-red-700 mt-2">
                      Öneri: Aylık birikimi artır veya daha düşük fiyatlı ev hedefle.
                    </p>
                  </div>
                )}

                <div className="space-y-2 text-xs sm:text-sm text-gray-700">
                  <p className="flex justify-between flex-wrap gap-2">
                    <span>Başlangıç Tapu Masrafı (%4):</span>
                    <span className="font-semibold">{results.tapuMasrafi.toLocaleString('tr-TR')} TL</span>
                  </p>
                  <p className="flex justify-between flex-wrap gap-2">
                    <span>Son Ev Fiyatı:</span>
                    <span className="font-semibold text-red-600">{results.finalHousePrice.toLocaleString('tr-TR')} TL</span>
                  </p>
                  <p className="flex justify-between flex-wrap gap-2">
                    <span>Son Tapu Masrafı:</span>
                    <span className="font-semibold text-orange-600">{results.finalTapu.toLocaleString('tr-TR')} TL</span>
                  </p>
                  <p className="flex justify-between flex-wrap gap-2 border-t pt-2 mt-2">
                    <span>Gereken Toplam Tutar:</span>
                    <span className="font-semibold">{results.finalTotal.toLocaleString('tr-TR')} TL</span>
                  </p>
                  <p className="flex justify-between flex-wrap gap-2">
                    <span>Son Birikim:</span>
                    <span className="font-semibold text-green-600">{results.finalSavings.toLocaleString('tr-TR')} TL</span>
                  </p>
                  {results.canAfford && (
                    <p className="flex justify-between flex-wrap gap-2 border-t pt-2 mt-2">
                      <span>Kalan:</span>
                      <span className="font-semibold text-orange-600">
                        {(results.finalSavings - results.finalTotal).toLocaleString('tr-TR')} TL
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chart */}
        {results && results.data.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-orange-700 mb-4 sm:mb-6">Grafik</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={results.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  label={{ value: 'Yıl', position: 'insideBottom', offset: -5 }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  label={{ value: 'TL', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value) => `${value.toLocaleString('tr-TR')} TL`} />
                <Legend />
                <Line type="monotone" dataKey="savings" stroke="#f97316" strokeWidth={2} name="Birikim" />
                <Line type="monotone" dataKey="housePrice" stroke="#dc2626" strokeWidth={2} name="Ev Fiyatı" />
                <Line type="monotone" dataKey="totalRequired" stroke="#9a3412" strokeWidth={2} strokeDasharray="5 5" name="Gereken Toplam" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Detailed Table */}
        {results && results.data.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-orange-700 mb-4 sm:mb-6">Detaylı Tablo</h2>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                <thead className="bg-orange-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Yıl</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Birikim</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Ev Fiyatı</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Gereken</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.data.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-orange-50'}>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-900">{row.year}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-green-600 font-medium">
                        {row.savings.toLocaleString('tr-TR')}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-red-600 font-medium">
                        {row.housePrice.toLocaleString('tr-TR')}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className={row.savings >= row.totalRequired ? 'text-green-600 font-bold' : 'text-gray-900'}>
                          {row.totalRequired.toLocaleString('tr-TR')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
