import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type View = 'discover' | 'exchanges' | 'skills'
type MatchStatus = '双向匹配' | '时间待协商' | '单向符合' | '灵感推荐'
type InviteStatus = '待确认' | '已约定' | '已取消'

type SkillProfile = {
  canTeach: string
  teachGoal: string
  wants: string
  learnGoal: string
  method: string
  time: string
  intro: string
}

type Partner = SkillProfile & {
  id: number
  name: string
  initial: string
  avatar: string
  category: string
  timeCompatible: boolean
}

type Invite = {
  id: string
  partnerId: number
  partnerName: string
  partnerInitial: string
  avatar: string
  teachSkill: string
  teachGoal: string
  learnSkill: string
  learnGoal: string
  method: string
  time: string
  message: string
  status: InviteStatus
  createdAt: string
}

type MatchFilter = '全部' | '双向匹配' | '线上可学'

const PROFILE_KEY = 'huanyike-profile-v3'
const INVITES_KEY = 'huanyike-invites-v3'

const skillGroups = [
  { label: '技术与效率', skills: ['Python', 'Excel 自动化', '数据分析', 'Notion'] },
  { label: '设计与创作', skills: ['手机摄影', '人像摄影', 'Figma 入门', '短视频剪辑'] },
  { label: '语言与表达', skills: ['英语表达', '日语会话', '演讲表达'] },
  { label: '生活与兴趣', skills: ['吉他弹唱', '咖啡手冲', '烘焙入门', '健身训练', '手账排版'] },
]

const filterMeta: Record<MatchFilter, { className: string; kicker: string; lead: string; tail: string; copy: string }> = {
  全部: { className: 'filter-all', kicker: 'YOUR EXCHANGE CIRCLE', lead: '为你找到', tail: '位互换伙伴', copy: '一次看一位，认真选择真正互补的人。' },
  双向匹配: { className: 'filter-mutual', kicker: 'PERFECT TWO-WAY FIT', lead: '发现', tail: '组双向互补', copy: '你想学的，恰好也是对方能教的。' },
  线上可学: { className: 'filter-online', kicker: 'LEARN FROM ANYWHERE', lead: '精选', tail: '位线上伙伴', copy: '不用通勤，今晚就能交换一堂小课。' },
}

const defaultProfile: SkillProfile = {
  canTeach: 'Python',
  teachGoal: '用 Python 自动整理一份 Excel 表格',
  wants: '手机摄影',
  learnGoal: '学会基础构图，拍出一张自然的人像',
  method: '线上',
  time: '工作日晚上',
  intro: '喜欢把复杂问题拆成简单步骤，也愿意认真准备每一次互换。',
}

const partners: Partner[] = [
  { id: 1, name: '小林', initial: '林', avatar: 'coral', category: '生活方式', canTeach: '手机摄影', teachGoal: '用自然光拍出一张松弛的人像', wants: 'Python', learnGoal: '自动整理日常表格', method: '线上', time: '周三晚上', timeCompatible: true, intro: '独立摄影爱好者，擅长把构图讲成人人都能上手的小练习。' },
  { id: 2, name: '嘉禾', initial: '禾', avatar: 'mint', category: '生活方式', canTeach: '手机摄影', teachGoal: '掌握三种稳定出片的构图方式', wants: 'Python', learnGoal: '写一个照片批量改名脚本', method: '线上', time: '周末下午', timeCompatible: false, intro: '喜欢城市漫游和纪实摄影，教学会从真实拍摄场景开始。' },
  { id: 3, name: '安然', initial: '然', avatar: 'violet', category: '生活方式', canTeach: '手机摄影', teachGoal: '用自然光记录有氛围感的日常', wants: '剪辑入门', learnGoal: '完成一支 30 秒生活短片', method: '北京同城', time: '工作日晚上', timeCompatible: true, intro: '擅长观察光影，也乐意分享一套不依赖器材的拍摄方法。' },
  { id: 4, name: '阿川', initial: '川', avatar: 'blue', category: '音乐', canTeach: '吉他弹唱', teachGoal: '完整弹唱一首喜欢的歌', wants: 'Python', learnGoal: '写一个简单的效率脚本', method: '线上', time: '周四晚上', timeCompatible: true, intro: '从零基础一路自学过来，更知道初学者会在哪些地方卡住。' },
  { id: 5, name: 'Nora', initial: 'N', avatar: 'yellow', category: '语言', canTeach: '英语表达', teachGoal: '完成一段两分钟英文自我介绍', wants: '数据分析', learnGoal: '看懂一张业务数据看板', method: '线上', time: '周二晚上', timeCompatible: true, intro: '互联网出海团队从业者，重视真实场景中的表达自信。' },
  { id: 6, name: '知夏', initial: '夏', avatar: 'pink', category: '设计', canTeach: 'Figma 入门', teachGoal: '独立画出一个移动端页面', wants: '摄影', learnGoal: '为作品集拍一组干净素材', method: '线上', time: '周日晚上', timeCompatible: false, intro: '产品设计师，喜欢用结构和组件帮助新手快速完成第一稿。' },
  { id: 7, name: '一航', initial: '航', avatar: 'navy', category: '职场', canTeach: '演讲表达', teachGoal: '把项目经历讲成三分钟故事', wants: 'Excel', learnGoal: '搭建一份清晰的项目台账', method: '线上 / 上海同城', time: '工作日晚上', timeCompatible: true, intro: '咨询顾问，擅长帮人把复杂内容整理成有重点的表达。' },
  { id: 8, name: '木木', initial: '木', avatar: 'green', category: '效率工具', canTeach: 'Notion', teachGoal: '搭建一套个人知识管理主页', wants: 'Python', learnGoal: '理解自动化脚本的基本思路', method: '线上', time: '周五晚上', timeCompatible: true, intro: '效率工具重度用户，相信好系统应该让人更轻松，而不是更忙。' },
  { id: 9, name: '江野', initial: '野', avatar: 'violet', category: '影像创作', canTeach: '人像摄影', teachGoal: '完成一组有情绪的自然光人像', wants: 'Python', learnGoal: '做一个照片自动归档工具', method: '线上 / 杭州同城', time: '工作日晚上', timeCompatible: true, intro: '自由摄影师，喜欢用简单的光线和动作引导，让普通人也能自然出镜。' },
  { id: 10, name: '小满', initial: '满', avatar: 'pink', category: '内容创作', canTeach: '手机摄影', teachGoal: '拍出一组适合社交媒体发布的照片', wants: 'Figma 入门', learnGoal: '制作一张活动宣传海报', method: '线上', time: '周六上午', timeCompatible: false, intro: '生活方式博主，擅长在日常空间里寻找好看的取景和色彩。' },
  { id: 11, name: '洛洛', initial: '洛', avatar: 'yellow', category: '生活方式', canTeach: '咖啡手冲', teachGoal: '稳定冲出一杯干净明亮的咖啡', wants: '英语表达', learnGoal: '能用英文介绍不同咖啡豆', method: '成都同城', time: '周日下午', timeCompatible: false, intro: '独立咖啡店主理人，愿意把参数背后的味道讲得简单一点。' },
  { id: 12, name: '沈言', initial: '言', avatar: 'blue', category: '视觉设计', canTeach: '摄影构图', teachGoal: '用三种构图完成一组城市观察', wants: 'Python', learnGoal: '批量生成作品集文件名', method: '线上', time: '周二晚上', timeCompatible: true, intro: '视觉设计师，习惯从版式和视觉动线解释一张照片为什么成立。' },
  { id: 13, name: 'Luna', initial: 'L', avatar: 'coral', category: '语言', canTeach: '日语会话', teachGoal: '完成一次五分钟旅行场景对话', wants: '手账排版', learnGoal: '做一页清晰的旅行计划', method: '线上', time: '周四晚上', timeCompatible: true, intro: '日语学习社群组织者，重视能马上用上的开口练习。' },
  { id: 14, name: '程野', initial: '程', avatar: 'navy', category: '城市观察', canTeach: '城市摄影', teachGoal: '完成一组有叙事感的街头照片', wants: 'Python', learnGoal: '整理并筛选大量照片文件', method: '上海同城', time: '周末白天', timeCompatible: false, intro: '建筑从业者，擅长从空间、比例和人的关系里寻找画面。' },
]

const demoInvites: Invite[] = [
  { id: 'demo-agreed', partnerId: 5, partnerName: 'Nora', partnerInitial: 'N', avatar: 'yellow', teachSkill: 'Python', teachGoal: '用脚本整理一份英文学习记录', learnSkill: '英语表达', learnGoal: '完成两分钟英文自我介绍', method: '线上', time: '周二 20:00', message: '想和你交换一堂具体的小课：先练表达，再一起把学习记录自动整理好。', status: '已约定', createdAt: '9/18 20:30' },
  { id: 'demo-pending', partnerId: 6, partnerName: '知夏', partnerInitial: '夏', avatar: 'pink', teachSkill: 'Python', teachGoal: '理解自动化脚本的基本思路', learnSkill: 'Figma 入门', learnGoal: '独立画出一个移动端页面', method: '线上', time: '周日 19:30', message: '我想学会搭出一个简单页面，也可以带你用 Python 完成一次文件整理。', status: '待确认', createdAt: '9/19 11:20' },
  { id: 'demo-cancelled', partnerId: 4, partnerName: '阿川', partnerInitial: '川', avatar: 'blue', teachSkill: 'Python', teachGoal: '写一个简单的效率脚本', learnSkill: '吉他弹唱', learnGoal: '完整弹唱一首喜欢的歌', method: '线上', time: '原定周四晚上', message: '这周时间没有对上，我们之后可以再约。', status: '已取消', createdAt: '9/16 18:40' },
]

const includesSkill = (source: string, target: string) => {
  const a = source.toLowerCase().replace(/\s/g, '')
  const b = target.toLowerCase().replace(/\s/g, '')
  const families = [['摄影', '手机摄影', '人像摄影', '摄影构图', '城市摄影'], ['python', '自动化脚本'], ['excel', '表格', '数据整理'], ['英语', '英文'], ['figma', '视觉设计']]
  return a.includes(b) || b.includes(a) || families.some(family => family.some(word => a.includes(word)) && family.some(word => b.includes(word)))
}

function getStatus(profile: SkillProfile, partner: Partner): MatchStatus {
  const canLearn = includesSkill(profile.wants, partner.canTeach)
  const canTeachBack = includesSkill(profile.canTeach, partner.wants)
  if (canLearn && canTeachBack) return partner.timeCompatible ? '双向匹配' : '时间待协商'
  if (canLearn) return '单向符合'
  return '灵感推荐'
}

function getReasons(profile: SkillProfile, partner: Partner) {
  const canLearn = includesSkill(profile.wants, partner.canTeach)
  const canTeachBack = includesSkill(profile.canTeach, partner.wants)
  const reasons: string[] = []
  if (canLearn) reasons.push(`TA 能教你${partner.canTeach}`)
  if (canTeachBack) reasons.push(`你能回教 TA ${profile.canTeach}`)
  if (profile.method.includes('线上') && partner.method.includes('线上')) reasons.push('双方都支持线上交流')
  reasons.push(partner.timeCompatible ? '有共同空闲时间' : '技能互补，时间需要协商')
  if (!canLearn && !canTeachBack) reasons.unshift(`${partner.canTeach}是一项可探索的新技能`)
  return reasons.slice(0, 4)
}

function Icon({ name }: { name: 'spark' | 'arrow' | 'close' | 'check' | 'calendar' | 'video' | 'bolt' | 'search' | 'swap' | 'book' | 'edit' | 'clock' }) {
  const paths = {
    spark: <path d="m12 3 1.85 5.15L19 10l-5.15 1.85L12 17l-1.85-5.15L5 10l5.15-1.85L12 3Zm6 12 .9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9L18 15Z" />,
    arrow: <path d="M5 12h13m-5-5 5 5-5 5" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    check: <path d="m5 12 4.2 4L19 7" />,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4m8-4v4M4 10h16" /></>,
    video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
    bolt: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></>,
    swap: <><path d="M7 7h11l-3-3m2 13H6l3 3" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5zM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" /></>,
    edit: <><path d="m4 20 4.5-1 10-10-3.5-3.5-10 10L4 20Z" /><path d="m13.5 7 3.5 3.5" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function App() {
  const [view, setView] = useState<View>('discover')
  const [profile, setProfile] = useState<SkillProfile>(() => {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '') || defaultProfile } catch { return defaultProfile }
  })
  const [invites, setInvites] = useState<Invite[]>(() => {
    try { return JSON.parse(localStorage.getItem(INVITES_KEY) || '') || demoInvites } catch { return demoInvites }
  })
  const [detail, setDetail] = useState<Partner | null>(null)
  const [inviteTarget, setInviteTarget] = useState<Partner | null>(null)
  const [editingSkill, setEditingSkill] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<MatchFilter>('全部')
  const [partnerIndex, setPartnerIndex] = useState(0)
  const [inviteTime, setInviteTime] = useState('周三 20:00')
  const [message, setMessage] = useState('')
  const [toast, setToast] = useState('')
  const [expandedInvite, setExpandedInvite] = useState<string | null>(null)

  useEffect(() => { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)) }, [profile])
  useEffect(() => { localStorage.setItem(INVITES_KEY, JSON.stringify(invites)) }, [invites])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setDetail(null); setInviteTarget(null); setEditingSkill(false) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])
  useEffect(() => { setPartnerIndex(0) }, [query, filter, profile])

  const result = useMemo(() => partners
    .map(partner => ({ partner, status: getStatus(profile, partner), reasons: getReasons(profile, partner) }))
    .filter(({ partner, status }) => {
      const haystack = `${partner.name}${partner.canTeach}${partner.teachGoal}${partner.wants}${partner.category}`.toLowerCase()
      const matchesQuery = haystack.includes(query.trim().toLowerCase())
      const matchesFilter = filter === '全部' || (filter === '双向匹配' && status === '双向匹配') || (filter === '线上可学' && partner.method.includes('线上'))
      return matchesQuery && matchesFilter
    })
    .sort((a, b) => {
      const featured: Record<MatchFilter, number[]> = { 全部: [1, 9, 2, 3], 双向匹配: [9, 12, 1], 线上可学: [5, 4, 7, 8, 13] }
      const order = featured[filter]
      const aRank = order.indexOf(a.partner.id)
      const bRank = order.indexOf(b.partner.id)
      if (aRank >= 0 || bRank >= 0) return (aRank < 0 ? 99 : aRank) - (bRank < 0 ? 99 : bRank)
      return ['双向匹配', '时间待协商', '单向符合', '灵感推荐'].indexOf(a.status) - ['双向匹配', '时间待协商', '单向符合', '灵感推荐'].indexOf(b.status)
    }), [profile, query, filter])

  const beginInvite = (partner: Partner) => {
    setDetail(null)
    setInviteTarget(partner)
    setInviteTime(partner.timeCompatible ? partner.time : '时间待协商')
    setMessage(`我想向你学习${partner.canTeach}，也可以教你${profile.teachGoal}。建议线上互换，双方各 30 分钟。`)
  }

  const sendInvite = () => {
    if (!inviteTarget) return
    const duplicate = invites.some(item => item.partnerId === inviteTarget.id && item.status !== '已取消')
    if (duplicate) { setInviteTarget(null); setView('exchanges'); setToast('你们已经有一条进行中的互换邀请'); return }
    const next: Invite = {
      id: `${Date.now()}`, partnerId: inviteTarget.id, partnerName: inviteTarget.name, partnerInitial: inviteTarget.initial, avatar: inviteTarget.avatar,
      teachSkill: profile.canTeach, teachGoal: profile.teachGoal, learnSkill: inviteTarget.canTeach, learnGoal: inviteTarget.teachGoal,
      method: profile.method.includes('线上') && inviteTarget.method.includes('线上') ? '线上' : inviteTarget.method,
      time: inviteTime, message, status: '待确认',
      createdAt: new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date()),
    }
    setInvites(current => [next, ...current])
    setInviteTarget(null); setExpandedInvite(next.id); setView('exchanges'); setToast('互换邀请已创建，等待对方确认')
  }

  const updateInvite = (id: string, status: InviteStatus) => {
    setInvites(items => items.map(item => item.id === id ? { ...item, status } : item))
    setToast(status === '已约定' ? '演示：对方已接受，首课计划已生成' : '邀请已取消')
  }

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setProfile(Object.fromEntries(data.entries()) as unknown as SkillProfile)
    setEditingSkill(false); setToast('技能卡已更新，推荐结果已重新计算')
  }

  const resetDemo = () => {
    if (!window.confirm('确定重置演示数据吗？你的技能卡和邀请记录将恢复默认状态。')) return
    setProfile(defaultProfile); setInvites(demoInvites); setView('discover'); setToast('演示数据已重置')
  }

  const go = (next: View) => { setView(next); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <div className={`app-shell view-${view}`}>
      <header className="topbar">
        <button className="brand" onClick={() => go('discover')} aria-label="换一课首页"><span className="brand-mark"><Icon name="swap" /></span><span>换一课<small>SkillSwap</small></span></button>
        <nav aria-label="主导航">
          <button className={view === 'discover' ? 'active' : ''} onClick={() => go('discover')}>发现互换</button>
          <button className={view === 'exchanges' ? 'active' : ''} onClick={() => go('exchanges')}>我的互换{invites.filter(i => i.status === '待确认').length > 0 && <b>{invites.filter(i => i.status === '待确认').length}</b>}</button>
          <button className={view === 'skills' ? 'active' : ''} onClick={() => go('skills')}>我的技能</button>
        </nav>
        <button className="publish" onClick={() => setEditingSkill(true)}>＋ 发布技能</button>
      </header>

      <div className="demo-strip"><span><i /> 演示模式</span> 操作数据保存在本浏览器，不代表真实用户行为。<button onClick={resetDemo}>重置演示数据</button></div>

      <main>
        {view === 'discover' && <>
          <section className="exchange-hero" aria-labelledby="page-title">
            <div className="hero-copy"><p className="hero-label">你的一技之长，也能点亮别人。</p><h1 id="page-title">用你会的，<br /><em>换你想学的。</em></h1><p className="hero-description">找到技能互补的人，<br />交换一堂真正想学的课。</p><a className="hero-cta" href="#match-title">遇见互换伙伴 <Icon name="arrow" /></a><span className="hero-footnote">不必是专家。从你会的一件小事开始。</span></div>
            <div className="hero-art"><img src={`${import.meta.env.BASE_URL}images/gumroad-side-project.svg?v=skill-swap`} alt="人物举着平板，气泡中写着换一课" /><span className="art-caption">一点拿手的，换一点新鲜的。</span><a className="art-credit" href="https://gumroad.com/" target="_blank" rel="noreferrer">Illustration: Gumroad ↗</a></div>
          </section>

          <section className="need-strip" aria-labelledby="need-title">
            <div><h2 id="need-title">我的互换需求</h2><p>{profile.method} · {profile.time}</p></div><div className="need-skill"><span>我能教</span><strong>{profile.canTeach}</strong><p>{profile.teachGoal}</p></div><Icon name="swap" /><div className="need-skill"><span>我想学</span><strong>{profile.wants}</strong><p>{profile.learnGoal}</p></div><button className="secondary" onClick={() => setEditingSkill(true)}>修改需求</button>
          </section>

          <section className={`matches ${filterMeta[filter].className}`} aria-labelledby="match-title">
            <div className="match-heading"><div><p className="section-kicker">{filterMeta[filter].kicker}</p><h2 id="match-title">{filterMeta[filter].lead} <em>{result.length}</em> {filterMeta[filter].tail}</h2></div><p>{filterMeta[filter].copy}</p></div>
            <div className="filterbar"><label className="search"><Icon name="search" /><input aria-label="搜索伙伴" value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索技能或昵称" /></label><div className="filter-pills">{(['全部', '双向匹配', '线上可学'] as const).map(item => <button key={item} aria-pressed={filter === item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
            {result.length ? <><div aria-live="polite">{result.slice(Math.min(partnerIndex, result.length - 1), Math.min(partnerIndex, result.length - 1) + 1).map(({ partner, status, reasons }) => <article className={`spotlight partner-theme-${partner.avatar}`} key={partner.id}>
              <div className="spotlight-color"><span className="match-label">{status}</span><div className="spotlight-subject"><span>{partner.name}可以教你</span><h3>{partner.canTeach}</h3><p>{partner.teachGoal}</p></div><div className="spotlight-signature"><span className="portrait-letter" aria-hidden="true">{partner.initial}</span><span>{partner.name}<small>演示伙伴 · {partner.category}</small></span><span className="hand-spark" aria-hidden="true">✳</span></div></div>
              <div className="spotlight-content"><p className="partner-quote">“{partner.intro}”</p><div className="return-skill"><span>作为交换，TA 想学</span><h4>{partner.wants}</h4><p>{partner.learnGoal}</p></div><p className="spotlight-time">{partner.method}　·　{partner.time}</p><ul className="match-reasons">{reasons.map(reason => <li key={reason}><Icon name="check" />{reason}</li>)}</ul><div className="spotlight-actions"><button className="primary" onClick={() => beginInvite(partner)}>发起互换 <Icon name="arrow" /></button><button className="secondary" onClick={() => setDetail(partner)}>查看详情</button></div></div>
            </article>)}</div><div className="partner-rail" aria-label="快速选择伙伴">{result.map(({ partner }, index) => <button key={partner.id} aria-pressed={index === partnerIndex} className={index === partnerIndex ? 'current' : ''} onClick={() => setPartnerIndex(index)} aria-label={`查看${partner.name}的互换卡`}><span className={`avatar ${partner.avatar}`}>{partner.initial}</span><span>{partner.name}<small>{partner.canTeach}</small></span></button>)}</div><div className="partner-pagination"><button className="partner-nav prev" aria-label="上一位伙伴" disabled={partnerIndex === 0} onClick={() => setPartnerIndex(i => Math.max(0, i - 1))}><b>←</b><span>上一位</span></button><p><strong>{Math.min(partnerIndex + 1, result.length)}</strong><span>/ {result.length}</span></p><button className="partner-nav next" aria-label="下一位伙伴" disabled={partnerIndex >= result.length - 1} onClick={() => setPartnerIndex(i => Math.min(result.length - 1, i + 1))}><span>下一位</span><b>→</b></button></div></> : <div className="empty-state"><div><Icon name="search" /></div><h3>暂时没有符合当前条件的伙伴</h3><p>试试清空关键词或查看全部结果。</p><button className="primary" onClick={() => { setQuery(''); setFilter('全部') }}>查看全部伙伴</button></div>}
          </section>
        </>}

        {view === 'skills' && <section className="workspace-page">
          <div className="page-heading"><div><p className="section-kicker">MY SKILL CARD</p><h1>让别人一眼看懂，<br /><span>你们可以怎样互换。</span></h1><p>具体目标比技能名称更重要。编辑后，发现页会立即重新计算匹配结果。</p></div><button className="publish large" onClick={() => setEditingSkill(true)}>编辑技能卡 <Icon name="edit" /></button></div>
          <div className="skill-management"><aside><span>01 / ACTIVE CARD</span><strong>1</strong><p>当前发布中的互换需求</p><span>02 / SKILL LIBRARY</span><strong>{skillGroups.reduce((total, group) => total + group.skills.length, 0)}</strong><p>可直接选择的演示技能</p></aside><article className="profile-card"><div className="profile-card-top"><div className="avatar navy">遥</div><div><span>演示身份</span><h2>阿遥的技能卡</h2><p>{profile.intro}</p></div><button className="icon-button" onClick={() => setEditingSkill(true)} aria-label="编辑技能卡"><Icon name="edit" /></button></div><div className="profile-exchange"><div><span>我能教</span><h3>{profile.canTeach}</h3><p>{profile.teachGoal}</p></div><div className="vertical-swap"><Icon name="swap" /></div><div><span>我想学</span><h3>{profile.wants}</h3><p>{profile.learnGoal}</p></div></div><div className="profile-meta"><span><Icon name="video" />{profile.method}</span><span><Icon name="calendar" />{profile.time}</span></div><button className="primary full" onClick={() => setEditingSkill(true)}>修改这张技能卡</button></article><div className="principle-card"><div className="skill-orbit" aria-hidden="true"><span>P</span><i>⇄</i><span>摄</span></div><span>PRODUCT PRINCIPLE</span><h3>交换的不是标签，<br />是一件能完成的小事。</h3><p>从技能库选择方向，再补充一个具体目标，匹配会更快、更准确。</p></div></div>
        </section>}

        {view === 'exchanges' && <section className="workspace-page">
          <div className="page-heading"><div><p className="section-kicker">MY EXCHANGES</p><h1>从发出邀请，<br /><span>走到约成第一课。</span></h1><p>邀请不等于成功。只有对方确认后，才进入具体的首课计划。</p></div><div className="exchange-summary"><div className="exchange-bubbles" aria-hidden="true"><span>英</span><i>⇄</i><span>Py</span></div><div className="status-summary"><div><strong>{invites.filter(i => i.status === '待确认').length}</strong><span>等待确认</span></div><div><strong>{invites.filter(i => i.status === '已约定').length}</strong><span>已经约定</span></div></div></div></div>
          {invites.length === 0 ? <div className="empty-state exchange-empty"><div><Icon name="swap" /></div><h3>还没有发出的互换邀请</h3><p>去发现页选择一位伙伴，提出一份具体的第一课交换计划。</p><button className="primary" onClick={() => go('discover')}>发现互换伙伴 <Icon name="arrow" /></button></div> : <div className="invite-list">{invites.map(invite => <article className={`invite-card ${invite.status === '已取消' ? 'cancelled' : ''}`} key={invite.id}>
            <div className="invite-main"><div className={`avatar large ${invite.avatar}`}>{invite.partnerInitial}</div><div className="invite-title"><span>与 {invite.partnerName} 的技能互换</span><h2>{invite.learnSkill} <small>×</small> {invite.teachSkill}</h2><p>创建于 {invite.createdAt}</p></div><span className={`status-badge ${invite.status === '已约定' ? 'agreed' : invite.status === '已取消' ? 'cancelled-badge' : ''}`}>{invite.status}</span></div>
            <div className="invite-snapshot"><div><span>你来教</span><strong>{invite.teachSkill}</strong><p>{invite.teachGoal}</p></div><div><span>你来学</span><strong>{invite.learnSkill}</strong><p>{invite.learnGoal}</p></div><div><span>拟定安排</span><strong>{invite.method}</strong><p>{invite.time} · 双方各 30 分钟</p></div></div>
            {expandedInvite === invite.id && <div className="invite-detail"><p className="invite-message">“{invite.message}”</p>{invite.status === '已约定' && <div className="lesson-plan"><div className="plan-heading"><span><Icon name="book" /> 首课计划模板</span><small>双方可共同修改</small></div><div className="plan-grid"><div><b>01 / 你来教 · 30 分钟</b><h3>{invite.teachSkill}</h3><p>目标：{invite.teachGoal}</p><span>准备一份可公开使用的示例材料</span></div><div><b>02 / 你来学 · 30 分钟</b><h3>{invite.learnSkill}</h3><p>目标：{invite.learnGoal}</p><span>准备手机，并提前选好练习场景</span></div></div></div>}</div>}
            <footer><button className="secondary" onClick={() => setExpandedInvite(expandedInvite === invite.id ? null : invite.id)}>{expandedInvite === invite.id ? '收起详情' : '查看详情'}</button>{invite.status === '待确认' && <><button className="text-danger" onClick={() => updateInvite(invite.id, '已取消')}>取消邀请</button><button className="demo-action" onClick={() => updateInvite(invite.id, '已约定')}>演示控制 · 模拟对方接受</button></>}{invite.status === '已约定' && <button className="primary" onClick={() => setExpandedInvite(invite.id)}>查看首课计划 <Icon name="arrow" /></button>}</footer>
          </article>)}</div>}
        </section>}
      </main>

      <footer className="site-footer"><div><span className="brand-mark small"><Icon name="swap" /></span><strong>换一课</strong><span>用明确的小目标，换一堂真正想学的课。</span></div><div><button onClick={() => go('discover')}>发现互换</button><button onClick={() => go('exchanges')}>我的互换</button><button onClick={resetDemo}>重置数据</button></div><small>演示原型 · 数据仅保存在本浏览器</small></footer>

      {detail && <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setDetail(null)}><section className="modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title"><button className="modal-close" onClick={() => setDetail(null)} aria-label="关闭"><Icon name="close" /></button><div className="modal-person"><div className={`avatar large ${detail.avatar}`}>{detail.initial}</div><div><span className={`tag static-tag ${getStatus(profile, detail) === '双向匹配' ? 'mutual' : 'pending'}`}>{getStatus(profile, detail)}</span><h2 id="detail-title">和 {detail.name} 换一课</h2><p>{detail.intro}</p></div></div><div className="modal-exchange"><div><span>TA 能教你</span><strong>{detail.canTeach}</strong><p>{detail.teachGoal}</p></div><div className="modal-arrow"><Icon name="swap" /></div><div><span>你能回教</span><strong>{profile.canTeach}</strong><p>{profile.teachGoal}</p></div></div><div className="modal-facts"><div><Icon name="video" /><span>方式</span><strong>{detail.method}</strong></div><div><Icon name="calendar" /><span>时间</span><strong>{detail.time}</strong></div></div><div className="why modal-why"><h4>为什么匹配</h4><ul>{getReasons(profile, detail).map(reason => <li key={reason}><Icon name="check" />{reason}</li>)}</ul></div><button className="primary full modal-action" onClick={() => beginInvite(detail)}>发起互换邀请 <Icon name="arrow" /></button></section></div>}

      {inviteTarget && <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setInviteTarget(null)}><section className="modal invite-modal" role="dialog" aria-modal="true" aria-labelledby="invite-title"><button className="modal-close" onClick={() => setInviteTarget(null)} aria-label="关闭"><Icon name="close" /></button><p className="section-kicker">EXCHANGE PROPOSAL</p><h2 id="invite-title">向 {inviteTarget.name} 发起互换</h2><p className="modal-lead">把想交换的内容和时间说清楚，对方确认后才算约定成功。</p><div className="proposal-pair"><span>你教 <b>{profile.canTeach}</b></span><Icon name="swap" /><span>你学 <b>{inviteTarget.canTeach}</b></span></div><label className="field"><span>拟定时间</span><input value={inviteTime} onChange={e => setInviteTime(e.target.value)} required /></label><label className="field"><span>邀请留言</span><textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} /></label><div className="modal-buttons"><button className="secondary plain" onClick={() => setInviteTarget(null)}>暂不发送</button><button className="primary" onClick={sendInvite}>发送互换邀请</button></div></section></div>}

      {editingSkill && <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setEditingSkill(false)}><section className="modal form-modal" role="dialog" aria-modal="true" aria-labelledby="skill-form-title"><button className="modal-close" onClick={() => setEditingSkill(false)} aria-label="关闭"><Icon name="close" /></button><p className="section-kicker">EDIT SKILL CARD</p><h2 id="skill-form-title">编辑我的互换需求</h2><p className="modal-lead">先从技能库选择方向，再补充一个能完成的小目标。</p><form onSubmit={saveProfile}><div className="form-grid"><label className="field"><span>我能教的技能 *</span><select name="canTeach" defaultValue={profile.canTeach} required>{skillGroups.map(group => <optgroup label={group.label} key={`teach-${group.label}`}>{group.skills.map(skill => <option key={skill}>{skill}</option>)}</optgroup>)}</select><small>已整理为 4 个类别，可直接选择</small></label><label className="field"><span>我想学的技能 *</span><select name="wants" defaultValue={profile.wants} required>{skillGroups.map(group => <optgroup label={group.label} key={`learn-${group.label}`}>{group.skills.map(skill => <option key={skill}>{skill}</option>)}</optgroup>)}</select><small>选择后会重新计算推荐伙伴</small></label><label className="field wide"><span>我能带对方完成什么 *</span><textarea name="teachGoal" defaultValue={profile.teachGoal} required rows={2} /></label><label className="field wide"><span>我的学习目标 *</span><textarea name="learnGoal" defaultValue={profile.learnGoal} required rows={2} /></label><label className="field"><span>交流方式 *</span><select name="method" defaultValue={profile.method}><option>线上</option><option>线下</option><option>线上 / 线下均可</option></select></label><label className="field"><span>通常方便的时间 *</span><select name="time" defaultValue={profile.time}><option>工作日晚上</option><option>周末上午</option><option>周末下午</option><option>周末晚上</option><option>时间待协商</option></select></label><label className="field wide"><span>一句话介绍</span><textarea name="intro" defaultValue={profile.intro} rows={2} /></label></div><div className="form-note"><Icon name="check" /> 保存后会更新技能卡，并重新计算推荐结果。</div><div className="modal-buttons"><button type="button" className="secondary plain" onClick={() => setEditingSkill(false)}>取消</button><button className="primary" type="submit">保存并重新匹配</button></div></form></section></div>}

      {toast && <div className="toast" role="status"><Icon name="check" />{toast}</div>}
    </div>
  )
}

export default App
