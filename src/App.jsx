import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'

// Google Fonts import
const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+Pro:wght@300;400;600;700&display=swap'

// Custom hook for animated counter
const useCounter = (end, duration = 2000) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * (end - 0) + 0))
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }, [end, duration])

  return count
}

// Format currency function
const formatCurrency = (value) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Input component
const PremiumInput = ({ label, name, value, onChange, placeholder, suffix = '', icon }) => (
  <div className="group">
    <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 block">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <span className="text-gray-500 text-lg">{icon}</span>
      </div>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full pl-12 pr-16 py-4 bg-[#16213e] border-2 border-[#1e3a5f] rounded-xl text-white text-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300 placeholder-gray-500"
        placeholder={placeholder}
        step="0.01"
      />
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
        <span className="text-amber-400 font-semibold">{suffix}</span>
      </div>
    </div>
  </div>
)

// Result card component
const ResultCard = ({ icon, label, value, subtitle, color = 'amber' }) => {
  const colorClasses = {
    amber: 'border-amber-400/30 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]',
    emerald: 'border-emerald-400/30 bg-gradient-to-br from-[#1a2e1a] to-[#0f2f1a]',
    rose: 'border-rose-400/30 bg-gradient-to-br from-[#2e1a1a] to-[#1a0f0f]',
    sky: 'border-sky-400/30 bg-gradient-to-br from-[#1a202e] to-[#0f141a]',
  }

  const iconColors = {
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
    sky: 'text-sky-400',
  }

  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-sm ${colorClasses[color]} shadow-2xl`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`text-3xl ${iconColors[color]}`}>{icon}</div>
        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
          {label}
        </div>
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
        {value}
      </div>
      {subtitle && (
        <div className="text-sm text-gray-400">
          {subtitle}
        </div>
      )}
    </div>
  )
}

// Timeline milestone component
const TimelineMilestone = ({ year, savings, housePrice, isActive, isCompleted }) => (
  <div className={`relative flex items-center mb-4 ${isCompleted ? 'opacity-40' : ''}`}>
    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-amber-400 scale-125 shadow-lg shadow-amber-400/50' : isCompleted ? 'bg-emerald-400' : 'bg-gray-600'}`} />
    <div className={`h-0.5 flex-1 mx-2 ${isActive ? 'bg-gradient-to-r from-amber-400 to-transparent' : isCompleted ? 'bg-emerald-400' : 'bg-gray-700'}`} />
    <div className={`flex-1 p-3 rounded-lg ${isActive ? 'bg-amber-400/10 border border-amber-400/30' : 'bg-[#16213e] border border-[#1e3a5f]'}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400 font-semibold uppercase">
          Yıl {year}
        </span>
        <span className="text-xs font-semibold text-white">
          {formatCurrency(savings)}
        </span>
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-gray-500">
          Ev: {formatCurrency(housePrice)}
        </span>
        <span className={`text-xs font-bold ${savings >= housePrice ? 'text-emerald-400' : 'text-amber-400'}`}>
          {savings >= housePrice ? '✓ Hedefe ulaşıldı' : `${formatCurrency(housePrice - savings)} kalan`}
        </span>
      </div>
    </div>
  </div>
)

function App() {
  const [inputs, setInputs] = useState({
    currentSavings: '',
    monthlySavings: '',
    monthlyReturn: '',
    housePrice: '',
    annualRealEstateGrowth: '',
  })

  const [results, setResults] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    const link = document.createElement('link')
    link.href = GOOGLE_FONTS_URL
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    return () => document.head.removeChild(link)
  }, [])

  const loadExample = () => {
    setInputs({
      currentSavings: '300000',
      monthlySavings: '20000',
      monthlyReturn: '1.5',
      housePrice: '4000000',
      annualRealEstateGrowth: '15',
    })
    setResults(null)
    setShowResults(false)
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
    setShowResults(false)
  }

  const handleChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value
    })
  }

  const calculate = () => {
    setIsCalculating(true)

    setTimeout(() => {
      const currentSavings = parseFloat(inputs.currentSavings) || 0
      const monthlySavings = parseFloat(inputs.monthlySavings) || 0
      const monthlyReturn = parseFloat(inputs.monthlyReturn) || 0
      const housePrice = parseFloat(inputs.housePrice) || 0
      const annualRealEstateGrowth = parseFloat(inputs.annualRealEstateGrowth) || 0

      if (housePrice <= 0) {
        setIsCalculating(false)
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
      const milestones = []
      let month = 0
      const maxMonths = 480

      while (month < maxMonths) {
        currentSavingsBalance = currentSavingsBalance * (1 + monthlyReturnRate) + monthlySavings
        currentHousePrice = currentHousePrice * (1 + monthlyHouseGrowthRate)

        const tapuMasrafi = currentHousePrice * 0.04
        const totalRequired = currentHousePrice + tapuMasrafi

        monthlyData.push({
          month: month + 1,
          savings: Math.round(currentSavingsBalance),
          housePrice: Math.round(currentHousePrice),
          totalRequired: Math.round(totalRequired),
        })

        if ((month + 1) % 12 === 0) {
          yearlyData.push({
            year: (month + 1) / 12,
            savings: Math.round(currentSavingsBalance),
            housePrice: Math.round(currentHousePrice),
            totalRequired: Math.round(totalRequired),
          })

          if ((month + 1) % 60 === 0) {
            milestones.push({
              year: (month + 1) / 12,
              savings: Math.round(currentSavingsBalance),
              housePrice: Math.round(currentHousePrice),
              totalRequired: Math.round(totalRequired),
            })
          }
        }

        if (currentSavingsBalance >= totalRequired) {
          break
        }

        month++
      }

      const finalData = monthlyData[monthlyData.length - 1]
      const canAfford = finalData.savings >= finalData.totalRequired
      const years = Math.floor(month / 12)
      const remainingMonths = month % 12

      // Calculate surplus/shortfall
      const surplusShortfall = finalData.savings - finalData.totalRequired

      setResults({
        months: month + 1,
        years,
        remainingMonths,
        currentSavings: Math.round(currentSavings),
        monthlySavings: Math.round(monthlySavings),
        finalSavings: finalData.savings,
        finalHousePrice: finalData.housePrice,
        finalTotal: finalData.totalRequired,
        surplusShortfall,
        canAfford,
        yearlyData,
        monthlyData,
        milestones,
      })

      setIsCalculating(false)
      setShowResults(true)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-[#0a1628] font-[Source_Sans_Pro]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#16213e] to-[#0a1628]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(212,_175,_55,_0.1)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,_rgba(212,_175,_55,_0.05)_0%,_transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="text-6xl mb-4">🏠</div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[Playfair_Display] text-white mb-4">
              Ev Alım<span className="text-amber-400">Planlayıcı</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              Birikimlerinizi akıllıca yönetin, hayalinizdeki eve ne zaman kavuşacağınızı hesaplayın
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-1">
              <div className="bg-[#16213e]/80 backdrop-blur-xl rounded-3xl p-8 border border-[#1e3a5f] shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold font-[Playfair_Display] text-white">
                    Finansal Veriler
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={loadExample}
                      className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#2a4a6f] text-amber-400 rounded-lg text-sm font-semibold transition-all duration-300 border border-[#1e3a5f] hover:border-amber-400/50"
                    >
                      Örnek Yükle
                    </button>
                    <button
                      onClick={clearInputs}
                      className="p-2 bg-[#1e3a5f] hover:bg-[#2a4a6f] text-gray-400 rounded-lg transition-all duration-300 border border-[#1e3a5f] hover:border-gray-500"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <PremiumInput
                    label="Mevcut Birikim"
                    name="currentSavings"
                    value={inputs.currentSavings}
                    onChange={handleChange}
                    placeholder="0"
                    suffix="TL"
                    icon="💰"
                  />

                  <PremiumInput
                    label="Aylık Birikim"
                    name="monthlySavings"
                    value={inputs.monthlySavings}
                    onChange={handleChange}
                    placeholder="0"
                    suffix="TL"
                    icon="📈"
                  />

                  <PremiumInput
                    label="Aylık Yatırım Getirisi"
                    name="monthlyReturn"
                    value={inputs.monthlyReturn}
                    onChange={handleChange}
                    placeholder="0"
                    suffix="%"
                    icon="🎯"
                  />

                  <PremiumInput
                    label="Evin Fiyatı"
                    name="housePrice"
                    value={inputs.housePrice}
                    onChange={handleChange}
                    placeholder="0"
                    suffix="TL"
                    icon="🏠"
                  />

                  <PremiumInput
                    label="Yıllık Emlak Artışı"
                    name="annualRealEstateGrowth"
                    value={inputs.annualRealEstateGrowth}
                    onChange={handleChange}
                    placeholder="0"
                    suffix="%"
                    icon="📊"
                  />
                </div>

                <button
                  onClick={calculate}
                  disabled={isCalculating}
                  className="w-full mt-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-400/30"
                >
                  {isCalculating ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin mr-2">⚡</span>
                      Hesaplanıyor...
                    </span>
                  ) : (
                    'Hesapla'
                  )}
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-2 space-y-6">
              {results ? (
                <>
                  {/* Main Result Banner */}
                  <div className={`bg-gradient-to-r ${results.canAfford ? 'from-emerald-900/40 to-emerald-800/20 border-emerald-400/30' : 'from-rose-900/40 to-rose-800/20 border-rose-400/30'} rounded-3xl p-8 border backdrop-blur-xl shadow-2xl`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className={`text-sm font-semibold uppercase tracking-wider mb-2 ${results.canAfford ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {results.canAfford ? '🎉 Hedefe Ulaşıldı!' : '⏳ Hedef Devam Ediyor'}
                        </div>
                        <div className="text-4xl sm:text-5xl font-bold font-[Playfair_Display] text-white mb-2">
                          {results.years} yıl {results.remainingMonths} ay
                        </div>
                        <div className="text-gray-400">
                          Toplam {results.months} ayda birikim tamamlanacak
                        </div>
                      </div>
                      <div className="text-6xl">
                        {results.canAfford ? '🎯' : '🎯'}
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <ResultCard
                      icon="💰"
                      label="Son Birikim"
                      value={formatCurrency(results.finalSavings)}
                      subtitle={`Başlangıç: ${formatCurrency(results.currentSavings)}`}
                      color="emerald"
                    />

                    <ResultCard
                      icon="🏠"
                      label="Son Ev Fiyatı"
                      value={formatCurrency(results.finalHousePrice)}
                      color="rose"
                    />

                    <ResultCard
                      icon="💸"
                      label="Gereken Toplam"
                      value={formatCurrency(results.finalTotal)}
                      subtitle="Ev + Tapu Masrafı"
                      color="amber"
                    />

                    <ResultCard
                      icon={results.surplusShortfall >= 0 ? '✅' : '⚠️'}
                      label={results.surplusShortfall >= 0 ? 'Fazla' : 'Eksi'}
                      value={formatCurrency(Math.abs(results.surplusShortfall))}
                      subtitle={results.surplusShortfall >= 0 ? 'Hedefi geçti' : 'Daha fazla birikim gerekli'}
                      color={results.surplusShortfall >= 0 ? 'emerald' : 'rose'}
                    />
                  </div>

                  {/* Progress Timeline */}
                  <div className="bg-[#16213e]/80 backdrop-blur-xl rounded-3xl p-8 border border-[#1e3a5f]">
                    <h3 className="text-2xl font-bold font-[Playfair_Display] text-white mb-6">
                      Yolculuk Zaman Çizelgesi
                    </h3>
                    <div className="space-y-3">
                      {results.milestones.slice(0, 6).map((milestone, index) => {
                        const isActive = results.years >= milestone.year
                        const isCompleted = results.years > milestone.year
                        return (
                          <TimelineMilestone
                            key={index}
                            year={milestone.year}
                            savings={milestone.savings}
                            housePrice={milestone.totalRequired}
                            isActive={isActive}
                            isCompleted={isCompleted}
                          />
                        )
                      })}
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="bg-[#16213e]/80 backdrop-blur-xl rounded-3xl p-8 border border-[#1e3a5f]">
                    <h3 className="text-2xl font-bold font-[Playfair_Display] text-white mb-6">
                      Birikim ve Ev Fiyatı Grafiği
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={results.yearlyData}>
                        <defs>
                          <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorHouse" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                        <XAxis
                          dataKey="year"
                          stroke="#9ca3af"
                          label={{ value: 'Yıl', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                          label={{ value: 'Milyon TL', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: '#16213e',
                            border: '1px solid #1e3a5f',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="savings"
                          stroke="#10b981"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorSavings)"
                          name="Birikim"
                        />
                        <Area
                          type="monotone"
                          dataKey="totalRequired"
                          stroke="#f43f5e"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorHouse)"
                          name="Gereken Toplam"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="bg-[#16213e]/50 backdrop-blur-xl rounded-3xl p-12 border border-[#1e3a5f] text-center">
                  <div className="text-8xl mb-6">🏠</div>
                  <h3 className="text-3xl font-bold font-[Playfair_Display] text-white mb-3">
                    Planlamaya Başla
                  </h3>
                  <p className="text-gray-400 text-lg max-w-md mx-auto">
                    Finansal verilerinizi girin ve "Hesapla" butonuna basarak evi ne zaman alabileceğinizi öğrenin.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
