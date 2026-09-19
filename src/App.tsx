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

const PROFILE_KEY = 'huanyike-profile-v2'
const INVITES_KEY = 'huanyike-invites-v2'

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
  { id: 3, name: '安然', initial: '然', avatar: 'violet', category: '生活方式', canTeach: '手机摄影', teachGoal: '用自然光记录有氛围感的日常', wants: '剪辑入门', learnGoal: '完成一支 30 秒生活短片', method: '线上 / 北京同城', time: '工作日晚上', timeCompatible: true, intro: '擅长观察光影，也乐意分享一套不依赖器材的拍摄方法。' },
  { id: 4, name: '阿川', initial: '川', avatar: 'blue', category: '音乐', canTeach: '吉他弹唱', teachGoal: '完整弹唱一首喜欢的歌', wants: 'Python', learnGoal: '写一个简单的效率脚本', method: '线上', time: '周四晚上', timeCompatible: true, intro: '从零基础一路自学过来，更知道初学者会在哪些地方卡住。' },
  { id: 5, name: 'Nora', initial: 'N', avatar: 'yellow', category: '语言', canTeach: '英语表达', teachGoal: '完成一段两分钟英文自我介绍', wants: '数据分析', learnGoal: '看懂一张业务数据看板', method: '线上', time: '周二晚上', timeCompatible: true, intro: '互联网出海团队从业者，重视真实场景中的表达自信。' },
  { id: 6, name: '知夏', initial: '夏', avatar: 'pink', category: '设计', canTeach: 'Figma 入门', teachGoal: '独立画出一个移动端页面', wants: '摄影', learnGoal: '为作品集拍一组干净素材', method: '线上', time: '周日晚上', timeCompatible: false, intro: '产品设计师，喜欢用结构和组件帮助新手快速完成第一稿。' },
  { id: 7, name: '一航', initial: '航', avatar: 'navy', category: '职场', canTeach: '演讲表达', teachGoal: '把项目经历讲成三分钟故事', wants: 'Excel', learnGoal: '搭建一份清晰的项目台账', method: '线上 / 上海同城', time: '工作日晚上', timeCompatible: true, intro: '咨询顾问，擅长帮人把复杂内容整理成有重点的表达。' },
  { id: 8, name: '木木', initial: '木', avatar: 'green', category: '效率工具', canTeach: 'Notion', teachGoal: '搭建一套个人知识管理主页', wants: 'Python', learnGoal: '理解自动化脚本的基本思路', method: '线上', time: '周五晚上', timeCompatible: true, intro: '效率工具重度用户，相信好系统应该让人更轻松，而不是更忙。' },
]

const includesSkill = (source: string, target: string) => {
  const a = source.toLowerCase().replace(/\s/g, '')
  const b = target.toLowerCase().replace(/\s/g, '')
  return a.includes(b) || b.includes(a) || (a.includes('摄影') && b.includes('摄影')) || (a.includes('excel') && b.includes('python'))
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
    try { return JSON.parse(localStorage.getItem(INVITES_KEY) || '[]') } catch { return [] }
  })
  const [detail, setDetail] = useState<Partner | null>(null)
  const [inviteTarget, setInviteTarget] = useState<Partner | null>(null)
  const [editingSkill, setEditingSkill] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'全部' | '双向匹配' | '线上可学'>('全部')
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
    .sort((a, b) => ['双向匹配', '时间待协商', '单向符合', '灵感推荐'].indexOf(a.status) - ['双向匹配', '时间待协商', '单向符合', '灵感推荐'].indexOf(b.status)), [profile, query, filter])

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
    setProfile(defaultProfile); setInvites([]); setView('discover'); setToast('演示数据已重置')
  }

  const go = (next: View) => { setView(next); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <div className="app-shell">
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

          <section className="matches" aria-labelledby="match-title">
            <div className="match-heading"><div><p className="section-kicker">MEET YOUR NEXT TEACHER</p><h2 id="match-title">下一课，跟谁学？</h2></div><p>从一个人、一个小目标开始。</p></div>
            <div className="filterbar"><label className="search"><Icon name="search" /><input aria-label="搜索伙伴" value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索技能或昵称" /></label><div className="filter-pills">{(['全部', '双向匹配', '线上可学'] as const).map(item => <button key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
            {result.length ? <><div aria-live="polite">{result.slice(Math.min(partnerIndex, result.length - 1), Math.min(partnerIndex, result.length - 1) + 1).map(({ partner, status, reasons }) => <article className="spotlight" key={partner.id}>
              <div className="spotlight-color"><span className="match-label">{status}</span><div className="spotlight-subject"><span>{partner.name}可以教你</span><h3>{partner.canTeach}</h3><p>{partner.teachGoal}</p></div><div className="spotlight-signature"><span className="portrait-letter" aria-hidden="true">{partner.initial}</span><span>{partner.name}<small>演示伙伴 · {partner.category}</small></span><span className="hand-spark" aria-hidden="true">✳</span></div></div>
              <div className="spotlight-content"><p className="partner-quote">“{partner.intro}”</p><div className="return-skill"><span>作为交换，TA 想学</span><h4>{partner.wants}</h4><p>{partner.learnGoal}</p></div><p className="spotlight-time">{partner.method}　·　{partner.time}</p><ul className="match-reasons">{reasons.map(reason => <li key={reason}><Icon name="check" />{reason}</li>)}</ul><div className="spotlight-actions"><button className="primary" onClick={() => beginInvite(partner)}>发起互换 <Icon name="arrow" /></button><button className="secondary" onClick={() => setDetail(partner)}>查看详情</button></div></div>
            </article>)}</div><div className="partner-pagination"><p><strong>{Math.min(partnerIndex + 1, result.length)}</strong> / {result.length} 位伙伴</p><div><button className="secondary" aria-label="上一位伙伴" disabled={partnerIndex === 0} onClick={() => setPartnerIndex(i => Math.max(0, i - 1))}>← 上一位</button><button className="secondary" aria-label="下一位伙伴" disabled={partnerIndex >= result.length - 1} onClick={() => setPartnerIndex(i => Math.min(result.length - 1, i + 1))}>下一位 →</button></div></div></> : <div className="empty-state"><div><Icon name="search" /></div><h3>暂时没有符合当前条件的伙伴</h3><p>试试清空关键词或查看全部结果。</p><button className="primary" onClick={() => { setQuery(''); setFilter('全部') }}>查看全部伙伴</button></div>}
          </section>
        </>}

        {view === 'skills' && <section className="workspace-page">
          <div className="page-heading"><div><p className="section-kicker">MY SKILL CARD</p><h1>让别人一眼看懂，<br /><span>你们可以怎样互换。</span></h1><p>具体目标比技能名称更重要。编辑后，发现页会立即重新计算匹配结果。</p></div><button className="publish large" onClick={() => setEditingSkill(true)}>编辑技能卡 <Icon name="edit" /></button></div>
          <div className="skill-management"><aside><span>01 / ACTIVE CARD</span><strong>1</strong><p>当前发布中的互换需求</p><span>02 / VISIBILITY</span><strong>公开演示</strong><p>仅用于当前作品体验</p></aside><article className="profile-card"><div className="profile-card-top"><div className="avatar navy">周</div><div><span>演示身份</span><h2>小周的技能卡</h2><p>{profile.intro}</p></div><button className="icon-button" onClick={() => setEditingSkill(true)} aria-label="编辑技能卡"><Icon name="edit" /></button></div><div className="profile-exchange"><div><span>我能教</span><h3>{profile.canTeach}</h3><p>{profile.teachGoal}</p></div><div className="vertical-swap"><Icon name="swap" /></div><div><span>我想学</span><h3>{profile.wants}</h3><p>{profile.learnGoal}</p></div></div><div className="profile-meta"><span><Icon name="video" />{profile.method}</span><span><Icon name="calendar" />{profile.time}</span></div><button className="primary full" onClick={() => setEditingSkill(true)}>修改这张技能卡</button></article><div className="principle-card"><span>PRODUCT PRINCIPLE</span><h3>交换的不是标签，<br />是一件能完成的小事。</h3><p>技能卡要求双方说清楚“能带对方完成什么”和“自己想学到什么”，减少匹配后的协商成本。</p></div></div>
        </section>}

        {view === 'exchanges' && <section className="workspace-page">
          <div className="page-heading"><div><p className="section-kicker">MY EXCHANGES</p><h1>从发出邀请，<br /><span>走到约成第一课。</span></h1><p>邀请不等于成功。只有对方确认后，才进入具体的首课计划。</p></div><div className="status-summary"><div><strong>{invites.filter(i => i.status === '待确认').length}</strong><span>等待确认</span></div><div><strong>{invites.filter(i => i.status === '已约定').length}</strong><span>已经约定</span></div></div></div>
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

      {editingSkill && <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setEditingSkill(false)}><section className="modal form-modal" role="dialog" aria-modal="true" aria-labelledby="skill-form-title"><button className="modal-close" onClick={() => setEditingSkill(false)} aria-label="关闭"><Icon name="close" /></button><p className="section-kicker">EDIT SKILL CARD</p><h2 id="skill-form-title">编辑我的互换需求</h2><p className="modal-lead">用一个可完成的小目标，让对方知道这一课能带走什么。</p><form onSubmit={saveProfile}><div className="form-grid"><label className="field"><span>我能教的技能 *</span><input name="canTeach" defaultValue={profile.canTeach} required /></label><label className="field"><span>我想学的技能 *</span><input name="wants" defaultValue={profile.wants} required /></label><label className="field wide"><span>我能带对方完成什么 *</span><textarea name="teachGoal" defaultValue={profile.teachGoal} required rows={2} /></label><label className="field wide"><span>我的学习目标 *</span><textarea name="learnGoal" defaultValue={profile.learnGoal} required rows={2} /></label><label className="field"><span>交流方式 *</span><select name="method" defaultValue={profile.method}><option>线上</option><option>线下</option><option>线上 / 线下均可</option></select></label><label className="field"><span>通常方便的时间 *</span><input name="time" defaultValue={profile.time} required /></label><label className="field wide"><span>一句话介绍</span><textarea name="intro" defaultValue={profile.intro} rows={2} /></label></div><div className="form-note"><Icon name="check" /> 保存后会更新技能卡，并重新计算推荐结果。</div><div className="modal-buttons"><button type="button" className="secondary plain" onClick={() => setEditingSkill(false)}>取消</button><button className="primary" type="submit">保存并重新匹配</button></div></form></section></div>}

      {toast && <div className="toast" role="status"><Icon name="check" />{toast}</div>}
    </div>
  )
}

export default App
