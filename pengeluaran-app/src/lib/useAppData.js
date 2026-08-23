import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export function useAppData() {
  const [wallets, setWallets] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [startingBalances, setStartingBalances] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [w, c, s, t, sb, g] = await Promise.all([
        supabase.from('wallets').select('*').order('created_at'),
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('subcategories').select('*').order('sort_order'),
        supabase.from('transactions').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('starting_balances').select('*'),
        supabase.from('goals').select('*').order('created_at'),
      ])
      if (w.error) throw w.error
      if (c.error) throw c.error
      if (s.error) throw s.error
      if (t.error) throw t.error
      if (sb.error) throw sb.error
      if (g.error) throw g.error
      setWallets(w.data || [])
      setCategories(c.data || [])
      setSubcategories(s.data || [])
      setTransactions(t.data || [])
      setStartingBalances(sb.data || [])
      setGoals(g.data || [])
    } catch (e) {
      console.error(e)
      setError(e.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addTransaction = useCallback(async (payload) => {
    const { error } = await supabase.from('transactions').insert(payload)
    if (error) throw error
    await refresh()
  }, [refresh])

  const updateTransaction = useCallback(async (id, payload) => {
    const { error } = await supabase.from('transactions').update(payload).eq('id', id)
    if (error) throw error
    await refresh()
  }, [refresh])

  const deleteTransaction = useCallback(async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
    await refresh()
  }, [refresh])

  const addCategory = useCallback(async (payload) => {
    const { error } = await supabase.from('categories').insert(payload)
    if (error) throw error
    await refresh()
  }, [refresh])

  const updateCategory = useCallback(async (id, payload) => {
    const { error } = await supabase.from('categories').update(payload).eq('id', id)
    if (error) throw error
    await refresh()
  }, [refresh])

  const deleteCategory = useCallback(async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    await refresh()
  }, [refresh])

  const addSubcategory = useCallback(async (payload) => {
    const { error } = await supabase.from('subcategories').insert(payload)
    if (error) throw error
    await refresh()
  }, [refresh])

  const deleteSubcategory = useCallback(async (id) => {
    const { error } = await supabase.from('subcategories').delete().eq('id', id)
    if (error) throw error
    await refresh()
  }, [refresh])

  const addWallet = useCallback(async (payload) => {
    const { error } = await supabase.from('wallets').insert(payload)
    if (error) throw error
    await refresh()
  }, [refresh])

  const deleteWallet = useCallback(async (id) => {
    const { error } = await supabase.from('wallets').delete().eq('id', id)
    if (error) throw error
    await refresh()
  }, [refresh])

  const setStartingBalance = useCallback(async (categoryId, amount) => {
    const { error } = await supabase
      .from('starting_balances')
      .upsert({ category_id: categoryId, amount, updated_at: new Date().toISOString() }, { onConflict: 'category_id' })
    if (error) throw error
    await refresh()
  }, [refresh])

  const addGoal = useCallback(async (payload) => {
    const { error } = await supabase.from('goals').insert({ ...payload, current_amount: payload.starting_amount || 0 })
    if (error) throw error
    await refresh()
  }, [refresh])

  const updateGoal = useCallback(async (id, payload) => {
    const { error } = await supabase.from('goals').update(payload).eq('id', id)
    if (error) throw error
    await refresh()
  }, [refresh])

  const deleteGoal = useCallback(async (id) => {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (error) throw error
    await refresh()
  }, [refresh])

  const addGoalContribution = useCallback(async (id, amount) => {
    const goal = goals.find((g) => g.id === id)
    if (!goal) return
    const { error } = await supabase.from('goals').update({ current_amount: Number(goal.current_amount) + Number(amount) }).eq('id', id)
    if (error) throw error
    await refresh()
  }, [refresh, goals])

  return {
    wallets, categories, subcategories, transactions, startingBalances, goals,
    loading, error, refresh,
    addTransaction, updateTransaction, deleteTransaction,
    addCategory, updateCategory, deleteCategory,
    addSubcategory, deleteSubcategory,
    addWallet, deleteWallet,
    setStartingBalance,
    addGoal, updateGoal, deleteGoal, addGoalContribution,
  }
}
