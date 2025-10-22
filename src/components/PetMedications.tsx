'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Pill, Calendar, CalendarDays, Clock, StickyNote, Sparkles, Save, Edit, X, Loader2, Check, AlertCircle } from 'lucide-react'

interface Medication {
  id: string
  medication_name: string
  dosage?: string
  frequency?: string
  start_date: string
  end_date?: string
  notes?: string
  is_active: boolean
}

interface MedicationLog {
  id: string
  medication_id: string
  given_at: string
  notes?: string
}

export default function PetMedications({ petId }: { petId: string }) {
  const [medications, setMedications] = useState<Medication[]>([])
  const [logs, setLogs] = useState<{ [key: string]: MedicationLog[] }>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedMedId, setExpandedMedId] = useState<string | null>(null)

  // Form state
  const [medicationName, setMedicationName] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Log form state
  const [showLogForm, setShowLogForm] = useState<string | null>(null)
  const [logGivenAt, setLogGivenAt] = useState('')
  const [logNotes, setLogNotes] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadMedications()
  }, [petId])

  const loadMedications = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('pet_medications')
      .select('*')
      .eq('pet_id', petId)
      .order('start_date', { ascending: false })

    setMedications(data || [])

    // Load logs for each medication
    if (data) {
      for (const med of data) {
        await loadLogsForMedication(med.id)
      }
    }

    setLoading(false)
  }

  const loadLogsForMedication = async (medicationId: string) => {
    const { data } = await supabase
      .from('pet_medication_logs')
      .select('*')
      .eq('medication_id', medicationId)
      .order('given_at', { ascending: false })
      .limit(5)

    setLogs(prev => ({ ...prev, [medicationId]: data || [] }))
  }

  const resetForm = () => {
    setMedicationName('')
    setDosage('')
    setFrequency('')
    setStartDate('')
    setEndDate('')
    setNotes('')
    setIsActive(true)
    setEditingId(null)
    setShowForm(false)
  }

  const resetLogForm = () => {
    setLogGivenAt('')
    setLogNotes('')
    setShowLogForm(null)
  }

  const handleEdit = (medication: Medication) => {
    setEditingId(medication.id)
    setMedicationName(medication.medication_name)
    setDosage(medication.dosage || '')
    setFrequency(medication.frequency || '')
    setStartDate(medication.start_date)
    setEndDate(medication.end_date || '')
    setNotes(medication.notes || '')
    setIsActive(medication.is_active)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const medicationData = {
      pet_id: petId,
      medication_name: medicationName,
      dosage: dosage || null,
      frequency: frequency || null,
      start_date: startDate,
      end_date: endDate || null,
      notes: notes || null,
      is_active: isActive,
    }

    if (editingId) {
      await supabase.from('pet_medications').update(medicationData).eq('id', editingId)
    } else {
      await supabase.from('pet_medications').insert(medicationData)
    }

    resetForm()
    loadMedications()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この投薬記録を削除してもよろしいですか？関連する投薬ログも削除されます。')) return
    await supabase.from('pet_medications').delete().eq('id', id)
    loadMedications()
  }

  const handleLogSubmit = async (e: React.FormEvent, medicationId: string) => {
    e.preventDefault()

    const logData = {
      medication_id: medicationId,
      given_at: logGivenAt,
      notes: logNotes || null,
    }

    await supabase.from('pet_medication_logs').insert(logData)

    resetLogForm()
    loadLogsForMedication(medicationId)
  }

  const handleDeleteLog = async (logId: string, medicationId: string) => {
    if (!confirm('この投薬ログを削除してもよろしいですか？')) return
    await supabase.from('pet_medication_logs').delete().eq('id', logId)
    loadLogsForMedication(medicationId)
  }

  return (
    <div className="space-y-6">
      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full gradient-primary text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          投薬を追加
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100 space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Pill className="w-6 h-6 text-purple-600" />
            <h3 className="font-bold text-gray-800">{editingId ? '投薬を編集' : '投薬を追加'}</h3>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Pill className="w-4 h-4" />
              薬の名前 *
            </label>
            <input
              type="text"
              required
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              placeholder="例: 抗生物質"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                用量
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="例: 10mg"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                頻度
              </label>
              <input
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="例: 1日2回（朝・夜）"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                開始日 *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                終了日（予定）
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm font-semibold text-gray-700">現在投薬中</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              メモ
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all resize-none"
              placeholder="獣医師の指示など"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 gradient-primary text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              {editingId ? <Edit className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {editingId ? '更新' : '保存'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              キャンセル
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-gray-400 mx-auto" />
            <p className="text-gray-500 mt-3">読み込み中...</p>
          </div>
        ) : medications.length > 0 ? (
          medications.map((medication, index) => (
            <div
              key={medication.id}
              className="p-5 bg-gradient-to-r from-white to-gray-50 border border-gray-100 rounded-2xl hover:shadow-md transition-all animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="w-5 h-5 text-purple-600" />
                      <h4 className="font-bold text-gray-800 text-lg">{medication.medication_name}</h4>
                      {medication.is_active ? (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          投薬中
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                          終了
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm mb-2">
                      {medication.dosage && (
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                          {medication.dosage}
                        </span>
                      )}
                      {medication.frequency && (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                          {medication.frequency}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-semibold">期間:</span>{' '}
                        {new Date(medication.start_date).toLocaleDateString('ja-JP')}
                        {medication.end_date && ` 〜 ${new Date(medication.end_date).toLocaleDateString('ja-JP')}`}
                      </p>
                      {medication.notes && (
                        <p className="p-3 bg-gray-50 rounded-xl mt-2 leading-relaxed">
                          {medication.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    <button
                      onClick={() => setExpandedMedId(expandedMedId === medication.id ? null : medication.id)}
                      className="flex-1 sm:flex-none text-xs px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-semibold transition-all"
                    >
                      {expandedMedId === medication.id ? '閉じる' : 'ログ'}
                    </button>
                    <button
                      onClick={() => handleEdit(medication)}
                      className="flex-1 sm:flex-none text-xs px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(medication.id)}
                      className="flex-1 sm:flex-none text-xs px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-all"
                    >
                      削除
                    </button>
                  </div>
                </div>

                {/* Logs Section */}
                {expandedMedId === medication.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    {/* Add Log Button */}
                    {showLogForm !== medication.id && (
                      <button
                        onClick={() => setShowLogForm(medication.id)}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <Check className="w-4 h-4" />
                        投薬を記録
                      </button>
                    )}

                    {/* Log Form */}
                    {showLogForm === medication.id && (
                      <form onSubmit={(e) => handleLogSubmit(e, medication.id)} className="bg-purple-50 p-4 rounded-xl space-y-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            投薬日時 *
                          </label>
                          <input
                            type="datetime-local"
                            required
                            value={logGivenAt}
                            onChange={(e) => setLogGivenAt(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            メモ
                          </label>
                          <input
                            type="text"
                            value={logNotes}
                            onChange={(e) => setLogNotes(e.target.value)}
                            placeholder="任意"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-all text-sm"
                          >
                            記録
                          </button>
                          <button
                            type="button"
                            onClick={resetLogForm}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-all text-sm"
                          >
                            キャンセル
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Logs List */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        投薬履歴（最新5件）
                      </h5>
                      {logs[medication.id] && logs[medication.id].length > 0 ? (
                        logs[medication.id].map((log) => (
                          <div key={log.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">
                                {new Date(log.given_at).toLocaleDateString('ja-JP', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              {log.notes && (
                                <p className="text-xs text-gray-600 mt-1">{log.notes}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteLog(log.id, medication.id)}
                              className="text-xs px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded font-semibold transition-all"
                            >
                              削除
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">まだ投薬記録がありません</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
            <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">まだ投薬記録がありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
