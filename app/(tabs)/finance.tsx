import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  Dimensions
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme'
import { Plus, X, ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, PiggyBank, Calendar } from 'lucide-react-native'
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Finance, FinanceType } from '@/types/database'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function FinanceScreen() {
  const { user } = useAuthStore()
  const { finances, fetchAllData, addFinance, deleteFinance } = useDataStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [transactionType, setTransactionType] = useState<FinanceType>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [transactionDate, setTransactionDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => { if (user) fetchAllData(user.id) }, [user])

  const monthlyStats = useMemo(() => {
    const monthStart = startOfMonth(new Date())
    const monthEnd = endOfMonth(new Date())
    const monthFinances = finances.filter(f => {
      const date = parseISO(f.date)
      return isWithinInterval(date, { start: monthStart, end: monthEnd })
    })
    const income = monthFinances.filter(f => f.type === 'income').reduce((acc, f) => acc + f.amount, 0)
    const expenses = monthFinances.filter(f => f.type === 'expense').reduce((acc, f) => acc + f.amount, 0)
    return { income, expenses, balance: income - expenses, transactions: monthFinances.length }
  }, [finances])

  const last6Months = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i))
      const monthEnd = endOfMonth(subMonths(new Date(), i))
      const monthFinances = finances.filter(f => {
        const date = parseISO(f.date)
        return isWithinInterval(date, { start: monthStart, end: monthEnd })
      })
      const income = monthFinances.filter(f => f.type === 'income').reduce((acc, f) => acc + f.amount, 0)
      const expenses = monthFinances.filter(f => f.type === 'expense').reduce((acc, f) => acc + f.amount, 0)
      months.push({ month: format(monthStart, 'MMM', { locale: ptBR }), income, expenses, balance: income - expenses })
    }
    return months
  }, [finances])

  const recentTransactions = useMemo(() => finances.slice(0, 8), [finances])

  const handleAddTransaction = async () => {
    if (!amount.trim() || !description.trim()) return Alert.alert('Erro', 'Preencha todos os campos')
    const amountValue = parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) return Alert.alert('Erro', 'Valor invalido')
    await addFinance({ user_id: user!.id, description: description.trim(), amount: amountValue, type: transactionType, date: transactionDate })
    setShowAddModal(false)
    setAmount('')
    setDescription('')
  }

  const handleDeleteTransaction = async (id: string) => {
    Alert.alert('Excluir Transacao', 'Excluir esta transacao?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => await deleteFinance(id) }
    ])
  }

  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Financas</Text>
              <Text style={styles.subtitle}>Controle seu dinheiro</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
              <Plus color={COLORS.white} size={22} />
            </TouchableOpacity>
          </View>

          {/* Balance Card */}
          <LinearGradient colors={[COLORS.blue, COLORS.blueDark]} style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo do Mes</Text>
            <Text style={styles.balanceValue}>{formatCurrency(monthlyStats.balance)}</Text>
            <View style={styles.balanceStats}>
              <View style={styles.balanceStat}>
                <View style={[styles.balanceIcon, { backgroundColor: COLORS.white + '20' }]}>
                  <ArrowUpRight color={COLORS.white} size={16} />
                </View>
                <View>
                  <Text style={styles.balanceStatLabel}>Receitas</Text>
                  <Text style={styles.balanceStatValue}>{formatCurrency(monthlyStats.income)}</Text>
                </View>
              </View>
              <View style={styles.balanceDivider} />
              <View style={styles.balanceStat}>
                <View style={[styles.balanceIcon, { backgroundColor: COLORS.white + '20' }]}>
                  <ArrowDownRight color={COLORS.white} size={16} />
                </View>
                <View>
                  <Text style={styles.balanceStatLabel}>Despesas</Text>
                  <Text style={styles.balanceStatValue}>{formatCurrency(monthlyStats.expenses)}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evolucao Semestral</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {last6Months.map((month, index) => {
                const maxAbs = Math.max(...last6Months.map(m => Math.abs(m.balance)), 1000)
                const barHeight = Math.max((Math.abs(month.balance) / maxAbs) * 70, 6)
                return (
                  <View key={index} style={styles.chartBarContainer}>
                    <View style={styles.chartBarWrapper}>
                      <View style={[styles.chartBar, { height: barHeight, backgroundColor: month.balance >= 0 ? COLORS.success : COLORS.error }]} />
                    </View>
                    <Text style={styles.chartLabel}>{month.month}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={[styles.quickStatCard, { backgroundColor: COLORS.success + '12' }]}>
            <PiggyBank color={COLORS.success} size={20} />
            <Text style={styles.quickStatValue}>{formatCurrency(monthlyStats.income)}</Text>
            <Text style={styles.quickStatLabel}>Receitas</Text>
          </View>
          <View style={[styles.quickStatCard, { backgroundColor: COLORS.error + '12' }]}>
            <TrendingUp color={COLORS.error} size={20} />
            <Text style={styles.quickStatValue}>{formatCurrency(monthlyStats.expenses)}</Text>
            <Text style={styles.quickStatLabel}>Despesas</Text>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transacoes Recentes</Text>
          {recentTransactions.map(transaction => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={[styles.transactionIcon, { backgroundColor: transaction.type === 'income' ? COLORS.success + '20' : COLORS.error + '20' }]}>
                {transaction.type === 'income' ? <ArrowUpRight color={COLORS.success} size={18} /> : <ArrowDownRight color={COLORS.error} size={18} />}
              </View>
              <View style={styles.transactionContent}>
                <Text style={styles.transactionDescription} numberOfLines={1}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>{format(parseISO(transaction.date), "d MMM", { locale: ptBR })}</Text>
              </View>
              <Text style={[styles.transactionAmount, { color: transaction.type === 'income' ? COLORS.success : COLORS.error }]}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </Text>
              <TouchableOpacity style={styles.transactionDelete} onPress={() => handleDeleteTransaction(transaction.id)}>
                <X color={COLORS.gray600} size={16} />
              </TouchableOpacity>
            </View>
          ))}
          {recentTransactions.length === 0 && (
            <View style={styles.emptyState}>
              <DollarSign color={COLORS.gray600} size={40} />
              <Text style={styles.emptyText}>Nenhuma transacao</Text>
              <Text style={styles.emptySubtext}>Adicione sua primeira transacao</Text>
            </View>
          )}
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Transacao</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X color={COLORS.white} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.typeSelector}>
              <TouchableOpacity style={[styles.typeButton, transactionType === 'income' && { backgroundColor: COLORS.success + '20', borderColor: COLORS.success }]} onPress={() => setTransactionType('income')}>
                <ArrowUpRight color={transactionType === 'income' ? COLORS.success : COLORS.gray500} size={18} />
                <Text style={[styles.typeText, transactionType === 'income' && { color: COLORS.success }]}>Receita</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeButton, transactionType === 'expense' && { backgroundColor: COLORS.error + '20', borderColor: COLORS.error }]} onPress={() => setTransactionType('expense')}>
                <ArrowDownRight color={transactionType === 'expense' ? COLORS.error : COLORS.gray500} size={18} />
                <Text style={[styles.typeText, transactionType === 'expense' && { color: COLORS.error }]}>Despesa</Text>
              </TouchableOpacity>
            </View>

            <TextInput style={styles.input} placeholder="Valor" placeholderTextColor={COLORS.gray500} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <TextInput style={styles.input} placeholder="Descricao" placeholderTextColor={COLORS.gray500} value={description} onChangeText={setDescription} />

            <TouchableOpacity style={styles.submitButton} onPress={handleAddTransaction}>
              <LinearGradient colors={[transactionType === 'income' ? COLORS.success : COLORS.error, transactionType === 'income' ? COLORS.success : COLORS.error]} style={styles.submitGradient}>
                <Text style={styles.submitText}>Adicionar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.smd },
  title: { ...TYPOGRAPHY.h1, color: COLORS.white },
  subtitle: { ...TYPOGRAPHY.bodySmall, color: COLORS.gray500, marginTop: 2 },
  addButton: { width: 44, height: 44, backgroundColor: COLORS.blue, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  balanceCard: { borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, marginTop: SPACING.sm },
  balanceLabel: { fontSize: 13, color: COLORS.white, opacity: 0.85, marginBottom: SPACING.xs },
  balanceValue: { fontSize: 36, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.lg },
  balanceStats: { flexDirection: 'row', alignItems: 'center' },
  balanceStat: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  balanceIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.smd },
  balanceStatLabel: { fontSize: 11, color: COLORS.white, opacity: 0.8 },
  balanceStatValue: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  balanceDivider: { width: 1, height: 36, backgroundColor: COLORS.white, opacity: 0.15, marginHorizontal: SPACING.smd },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.white, marginBottom: SPACING.smd },
  chartCard: { backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.lg, padding: SPACING.smd },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  chartBarContainer: { flex: 1, alignItems: 'center' },
  chartBarWrapper: { height: 70, width: '70%', alignItems: 'center', justifyContent: 'flex-end', marginBottom: SPACING.xs },
  chartBar: { width: '100%', borderRadius: 3, minHeight: 6 },
  chartLabel: { fontSize: 11, color: COLORS.gray500, textTransform: 'capitalize' },
  quickStats: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: SPACING.smd, marginBottom: SPACING.lg },
  quickStatCard: { flex: 1, borderRadius: BORDER_RADIUS.lg, padding: SPACING.smd, alignItems: 'center' },
  quickStatValue: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginTop: SPACING.sm },
  quickStatLabel: { fontSize: 11, color: COLORS.gray500, marginTop: 2 },
  transactionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.md, padding: SPACING.smd, marginBottom: SPACING.sm },
  transactionIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.smd },
  transactionContent: { flex: 1 },
  transactionDescription: { fontSize: 14, fontWeight: '500', color: COLORS.white, marginBottom: 2 },
  transactionDate: { fontSize: 11, color: COLORS.gray500 },
  transactionAmount: { fontSize: 14, fontWeight: '700', marginRight: SPACING.sm },
  transactionDelete: { padding: SPACING.sm },
  emptyState: { backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.lg, padding: SPACING.xl, alignItems: 'center' },
  emptyText: { ...TYPOGRAPHY.body, fontWeight: '600', color: COLORS.gray400, marginTop: SPACING.smd },
  emptySubtext: { ...TYPOGRAPHY.bodySmall, color: COLORS.gray600, marginTop: SPACING.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.darkGray, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, padding: SPACING.lg, paddingBottom: SPACING.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { ...TYPOGRAPHY.h3, color: COLORS.white },
  typeSelector: { flexDirection: 'row', marginBottom: SPACING.smd },
  typeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.smd, backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.md, marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.gray700 },
  typeText: { fontSize: 14, color: COLORS.gray500, marginLeft: SPACING.xs, fontWeight: '500' },
  input: { backgroundColor: COLORS.elevatedBg, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.smd, paddingVertical: SPACING.smd, fontSize: 15, color: COLORS.white, marginBottom: SPACING.smd },
  submitButton: { marginTop: SPACING.sm },
  submitGradient: { paddingVertical: SPACING.smd, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  submitText: { fontSize: 15, fontWeight: '600', color: COLORS.white }
})
