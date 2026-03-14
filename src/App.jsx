import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Yardımcı fonksiyonlar
const formatCurrency = (value) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const InputField = ({ label, name, value, onChange, placeholder, suffix = '' }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
        placeholder={placeholder}
        step="0.01"
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
          {suffix}
        </span>
      )}
    </div>
  </div>
)

const ResultCard = ({ icon, title, value, subtitle, color = 'orange' }) => {
  const colorClasses = {
    orange: 'bg-orange-50 text-orange-800 border-orange-200',
    green: 'bg-green-50 text-green-800 border-green-200',
    red: 'bg-red-50 text-red-800 border-red-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
  }

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs mt-1 opacity-70">{subtitle}</p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}

function App() {
  const [inputs, setInputs] = useState({
    currentSavings: '',
    monthlySavings: '',
    monthlyReturn: '',
    housePrice: '',
    annualRealEstateGrowth: '',
  })

  const [results, setResults] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const loadExample = () => {
    setInputs({
      currentSavings: '300000',
      monthlySavings: '20000',
      monthlyReturn: '1.5',
      housePrice: '4000000',
      annualRealEstateGrowth: '15',
    })
  }

  const clearInputs = () => {
    setInputs({
      currentSavings: '',
      monthlySavings: '',
      monthlyReturn: '',
      housePrice: '',
      annualRealEstateGrowth: '',
    })
    setResults(null)
    setShowDetails(false)
  }

  const handleChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value
    })
  }

  const calculate = () => {
    // Inputları parse et
    const currentSavings = parseFloat(inputs.currentSavings) || 0
    const monthlySavings = parseFloat(inputs.monthlySavings) || 0
    const monthlyReturn = parseFloat(inputs.monthlyReturn) || 0
    const housePrice = parseFloat(inputs.housePrice) || 0
    const annualRealEstateGrowth = parseFloat(inputs.annualRealEstateGrowth) || 0

    // Doğrula
    if (housePrice <= 0) {
      alert('Lütfen geçerli bir ev fiyatı girin')
      return
    }

    const monthlyRealEstateGrowth = annualRealEstateGrowth / 12
    const monthlyReturnRate = monthlyReturn / 100
    const monthlyHouseGrowthRate = monthlyRealEstateGrowth / 100

    let currentSavingsBalance = currentSavings
    let currentHousePrice = housePrice
    const monthlyData = []
    const yearlyData = []
    let month = 0
    const maxMonths = 480 // 40 yıl max

    while (month < maxMonths) {
      // Aylık birikim artışı
      currentSavingsBalance = currentSavingsBalance * (1 + monthlyReturnRate) + monthlySavings

      // Aylık ev fiyatı artışı
      currentHousePrice = currentHousePrice * (1 + monthlyHouseGrowthRate)

      // Gereken toplam (ev fiyatı + tapu masrafı %4)
      const tapuMasrafi = currentHousePrice * 0.04
      const totalRequired = currentHousePrice + tapuMasrafi

      // Aylık veri kaydet
      monthlyData.push({
        month: month + 1,
        savings: Math.round(currentSavingsBalance),
        housePrice: Math.round(currentHousePrice),
        totalRequired: Math.round(totalRequired),
        tapuMasrafi: Math.round(tapuMasrafi),
        canAfford: currentSavingsBalance >= totalRequired,
      })

      // Yıllık veri kaydet
      if ((month + 1) % 12 === 0) {
        yearlyData.push({
          year: (month + 1) / 12,
          savings: Math.round(currentSavingsBalance),
          housePrice: Math.round(currentHousePrice),
          totalRequired: Math.round(totalRequired),
        })
      }

      // Evi alabilir mi?
      if (currentSavingsBalance >= totalRequired) {
        break
      }

      month++
    }

    const finalData = monthlyData[monthlyData.length - 1]
    const canAfford = finalData.canAfford
    const years = Math.floor(month / 12)
    const remainingMonths = month % 12

    setResults({
      months: month + 1,
      years,
      remainingMonths,
      currentSavings: Math.round(currentSavings),
      monthlySavings: Math.round(monthlySavings),
      finalSavings: finalData.savings,
      finalHousePrice: finalData.housePrice,
      finalTapu: finalData.tapuMasrafi,
      finalTotal: finalData.totalRequired,
      initialTapu: Math.round(housePrice * 0.04),
      initialTotal: Math.round(housePrice * (1 + 0.04)),
      canAfford,
      yearlyData,
      monthlyData,
    })

    setShowDetails(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            🏠 Ev Alım Planlayıcı
          </h1>
          <p className="text-gray-600">Birikimlerinizi planlayın, hayalinizdeki eve ne zaman kavuşacağınızı öğrenin</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sol taraf - Inputlar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">📝 Bilgiler</h2>
                <button
                  onClick={loadExample}
                  className="text-sm px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors"
                >
                  Örnek Yükle
                </button>
              </div>

              <div className="space-y-4">
                <InputField
                  label="Mevcut Birikim"
                  name="currentSavings"
                  value={inputs.currentSavings}
                  onChange={handleChange}
                  placeholder="0"
                  suffix="TL"
                />

                <InputField
                  label="Aylık Birikim"
                  name="monthlySavings"
                  value={inputs.monthlySavings}
                  onChange={handleChange}
                  placeholder="0"
                  suffix="TL"
                />

                <InputField
                  label="Aylık Yatırım Getirisi"
                  name="monthlyReturn"
                  value={inputs.monthlyReturn}
                  onChange={handleChange}
                  placeholder="0"
                  suffix="%"
                />

                <InputField
                  label="Evin Fiyatı"
                  name="housePrice"
                  value={inputs.housePrice}
                  onChange={handleChange}
                  placeholder="0"
                  suffix="TL"
                />

                <InputField
                  label="Yıllık Emlak Artışı"
                  name="annualRealEstateGrowth"
                  value={inputs.annualRealEstateGrowth}
                  onChange={handleChange}
                  placeholder="0"
                  suffix="%"
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={calculate}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  Hesapla
                </button>
                <button
                  onClick={clearInputs}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>

          {/* Sağ taraf - Sonuçlar */}
          <div className="lg:col-span-2 space-y-4">
            {results ? (
              <>
                {/* Ana Sonuç */}
                <ResultCard
                  icon={results.canAfford ? '🎉' : '😔'}
                  title={results.canAfford ? 'Harika! Evi alabilirsin!' : 'Daha fazla birikim yapmalısın'}
                  value={
                    results.canAfford
                      ? `${results.years} yıl ${results.remainingMonths} ay`
                      : '40 yıl içinde yetişmez'
                  }
                  subtitle={
                    results.canAfford
                      ? `Toplam ${results.months} ayda birikim tamamlanacak`
                      : 'Aylık birikimi artırarak deneyin'
                  }
                  color={results.canAfford ? 'green' : 'red'}
                />

                {/* Detay Kartları */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <ResultCard
                    icon="💰"
                    title="Son Birikim"
                    value={formatCurrency(results.finalSavings)}
                    subtitle={`Başlangıç: ${formatCurrency(results.currentSavings)}`}
                    color="green"
                  />

                  <ResultCard
                    icon="🏠"
                    title="Son Ev Fiyatı"
                    value={formatCurrency(results.finalHousePrice)}
                    color="red"
                  />

                  <ResultCard
                    icon="📋"
                    title="Son Tapu Masrafı"
                    value={formatCurrency(results.finalTapu)}
                    subtitle={`Ev fiyatının %4'ü`}
                    color="blue"
                  />

                  <ResultCard
                    icon="💸"
                    title="Gereken Toplam"
                    value={formatCurrency(results.finalTotal)}
                    subtitle={`Ev + Tapu`}
                    color="orange"
                  />
                </div>

                {/* Toggle Details */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    {showDetails ? 'Detayları Gizle ▲' : 'Detayları Göster ▼'}
                  </button>
                </div>

                {/* Grafik ve Tablo */}
                {showDetails && (
                  <div className="space-y-4">
                    {/* Grafik */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Grafik</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={results.yearlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis
                            dataKey="year"
                            label={{ value: 'Yıl', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis
                            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                            label={{ value: 'Milyon TL', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="savings"
                            stroke="#f97316"
                            strokeWidth={3}
                            name="Birikim"
                            dot={{ fill: '#f97316', strokeWidth: 2 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="totalRequired"
                            stroke="#dc2626"
                            strokeWidth={3}
                            name="Gereken Toplam"
                            strokeDasharray="5 5"
                            dot={{ fill: '#dc2626', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Detaylı Tablo */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Yıllık Özet</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-gray-200">
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Yıl</th>
                              <th className="text-right py-3 px-4 font-semibold text-gray-700">Birikim</th>
                              <th className="text-right py-3 px-4 font-semibold text-gray-700">Ev Fiyatı</th>
                              <th className="text-right py-3 px-4 font-semibold text-gray-700">Gereken</th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-700">Durum</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.yearlyData.map((row, index) => (
                              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-gray-900">{row.year}</td>
                                <td className="py-3 px-4 text-right text-green-600 font-medium">
                                  {formatCurrency(row.savings)}
                                </td>
                                <td className="py-3 px-4 text-right text-red-600 font-medium">
                                  {formatCurrency(row.housePrice)}
                                </td>
                                <td className="py-3 px-4 text-right text-orange-600 font-medium">
                                  {formatCurrency(row.totalRequired)}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {row.savings >= row.totalRequired ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                      ✅ Tamamlandı
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                                      ⏳ Devam ediyor
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Hesaplama Yapın</h3>
                <p className="text-gray-600">
                  Bilgileri girip "Hesapla" butonuna basarak evi ne zaman alabileceğinizi öğrenin.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
