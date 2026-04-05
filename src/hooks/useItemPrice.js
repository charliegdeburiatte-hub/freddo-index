import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Returns current freddo conversion + price history for a single item
export const useItemPrice = (slug) => {
  const [current, setCurrent] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return

    const fetch = async () => {
      try {
        const { data: conversion, error: convErr } = await supabase
          .from('freddo_conversions')
          .select('*')
          .eq('slug', slug)
          .single()

        // PGRST116 = no rows — item exists but has no price yet
        if (convErr && convErr.code !== 'PGRST116') throw convErr
        setCurrent(conversion || null)

        const { data: hist, error: histErr } = await supabase
          .from('price_records')
          .select('price_pence, recorded_at, is_stale, supermarket')
          .eq('item_slug', slug)
          .eq('is_available', true)
          .order('recorded_at', { ascending: true })

        if (histErr) throw histErr
        setHistory(hist || [])
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [slug])

  return { current, history, loading, error }
}

// Fetch all items in a category — joins items table with freddo_conversions
// Returns items even if they have no price yet
export const useCategoryItems = (category) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!category) return

    const fetch = async () => {
      try {
        const { data: allItems, error: itemsErr } = await supabase
          .from('items')
          .select('*')
          .eq('category', category)
          .eq('is_active', true)
          .order('name', { ascending: true })

        if (itemsErr) throw itemsErr

        const { data: conversions, error: convErr } = await supabase
          .from('freddo_conversions')
          .select('*')
          .eq('category', category)

        if (convErr) throw convErr

        const conversionMap = Object.fromEntries(
          (conversions || []).map(c => [c.slug, c])
        )

        setItems((allItems || []).map(item => ({
          ...item,
          conversion: conversionMap[item.slug] || null,
        })))
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [category])

  return { items, loading, error }
}

// Fetch home page items — display_on_home = true, with conversions
export const useHomeItems = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error: err } = await supabase
          .from('freddo_conversions')
          .select('*')
          .eq('display_on_home', true)
          .order('category', { ascending: true })

        if (err) throw err
        setItems(data || [])
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  return { items, loading, error }
}
