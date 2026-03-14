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

    while (currentSavings < currentHousePrice && month < maxMonths) {
      // Aylık faiz
      currentSavings = currentSavings * (1 + inputs.monthlyReturn / 100) + inputs.monthlySavings

      // Aylık emlak artışı (yıllık / 12)
      const monthlyHouseGrowth = inputs.annualRealEstateGrowth / 12 / 100
      currentHousePrice = currentHousePrice * (1 + monthlyHouseGrowth)

      data.push({
        year: (month / 12).toFixed(1),
        savings: Math.round(currentSavings),
        housePrice: Math.round(currentHousePrice)
      })

      month++
    }

    const canAfford = currentSavings >= currentHousePrice

    const years = Math.floor(month / 12)
    const months = month % 12

    setResults({
      months,
      years,
      monthsRemaining: months,
      finalSavings: Math.round(currentSavings),
      finalHousePrice: Math.round(currentHousePrice),
      tapuMasrafi: Math.round(tapuMasrafi),
      totalRequired: Math.round(totalRequired),
      data,
      canAfford
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-600 mb-8 text-center">
          🏠 Ev Alım Planlayıcı
        </h1>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-orange-700 mb-6">Bilgileri Gir</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mevcut Birikim (TL)
                </label>
                <input
                  type="number"
                  name="currentSavings"
                  value={inputs.currentSavings}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Örn: 500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aylık Birikim (TL)
                </label>
                <input
                  type="number"
                  name="monthlySavings"
                  value={inputs.monthlySavings}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Örn: 15000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aylık Yatırım Getirisi (%)
                </label>
                <input
                  type="number"
                  name="monthlyReturn"
                  value={inputs.monthlyReturn}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Örn: 1.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evin Şu Anki Fiyatı (TL)
                </label>
                <input
                  type="number"
                  name="housePrice"
                  value={inputs.housePrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Örn: 3000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yıllık Emlak Artışı (%)
                </label>
                <input
                  type="number"
                  name="annualRealEstateGrowth"
                  value={inputs.annualRealEstateGrowth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Örn: 15"
                />
              </div>

              <button
                onClick={calculate}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Hesapla
              </button>
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-orange-700 mb-6">Sonuçlar</h2>

              <div className="space-y-4">
                {results.canAfford ? (
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-lg font-semibold text-green-800">
                      🎉 Evi {results.years} yıl {results.monthsRemaining} ay sonra alabilirsin!
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-lg font-semibold text-red-800">
                      😔 Bu koşullarla 40 yıl içinde evi alamazsın.
                    </p>
                    <p className="text-sm text-red-700 mt-2">
                      Öneri: Aylık birikimi artır veya daha düşük fiyatlı ev hedefle.
                    </p>
                  </div>
                )}

                <div className="space-y-2 text-gray-700">
                  <p className="flex justify-between">
                    <span>Tapu Masrafı (%4):</span>
                    <span className="font-semibold">{results.tapuMasrafi.toLocaleString('tr-TR')} TL</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Gereken Toplam Tutar:</span>
                    <span className="font-semibold">{results.totalRequired.toLocaleString('tr-TR')} TL</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Son Birikim:</span>
                    <span className="font-semibold text-green-600">{results.finalSavings.toLocaleString('tr-TR')} TL</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Son Ev Fiyatı:</span>
                    <span className="font-semibold text-red-600">{results.finalHousePrice.toLocaleString('tr-TR')} TL</span>
                  </p>
                  {results.canAfford && (
                    <p className="flex justify-between border-t pt-2 mt-2">
                      <span>Kalan:</span>
                      <span className="font-semibold text-orange-600">
                        {(results.finalSavings - results.finalHousePrice).toLocaleString('tr-TR')} TL
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
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-orange-700 mb-6">Grafik</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={results.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: 'Yıl', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'TL', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `${value.toLocaleString('tr-TR')} TL`} />
                <Legend />
                <Line type="monotone" dataKey="savings" stroke="#f97316" strokeWidth={2} name="Birikim" />
                <Line type="monotone" dataKey="housePrice" stroke="#dc2626" strokeWidth={2} name="Ev Fiyatı" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Detailed Table */}
        {results && results.data.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-orange-700 mb-6">Detaylı Tablo</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-orange-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Yıl</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Birikim</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Ev Fiyatı</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Kalan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.data.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-orange-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {row.savings.toLocaleString('tr-TR')} TL
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        {row.housePrice.toLocaleString('tr-TR')} TL
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={row.savings >= row.housePrice ? 'text-green-600 font-bold' : 'text-gray-900'}>
                          {(row.savings - row.housePrice).toLocaleString('tr-TR')} TL
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
