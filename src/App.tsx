import { useEffect, useState } from 'react'

type Partner = {
  id: number
  name: string
  initial: string
  avatar: string
  status: '双向匹配' | '时间待协商' | '单向符合'
  canTeach: string
  canGoal: string
  wants: string
  wantsGoal: string
  method: string
  time: string
  reasons: string[]
  note: string
}

const partners: Partner[] = [
  {
    id: 1,
    name: '小林',
    initial: '林',
    avatar: 'coral',
    status: '双向匹配',
    canTeach: '手机摄影',
    canGoal: '拍出一张自然的人像',
    wants: 'Python',
    wantsGoal: '自动整理日常表格',
    method: '线上',
    time: '周三晚上',
    reasons: ['她能教你手机摄影', '你能教她 Python', '都支持线上交流', '有共同空闲时间'],
    note: '我会从构图、光线和抓拍节奏开始，带你用手机完成一张有故事感的人像。',
  },
  {
    id: 2,
    name: '阿川',
    initial: '川',
    avatar: 'blue',
    status: '时间待协商',
    canTeach: '吉他弹唱',
    canGoal: '完整弹唱一首喜欢的歌',
    wants: 'Python',
    wantsGoal: '写一个简单的效率脚本',
    method: '线上',
    time: '周末下午 · 待协商',
    reasons: ['你可以帮他完成 Python 入门', '他的教学目标清晰可落地', '双方都接受线上互换', '空闲时间需要一起确认'],
    note: '刚学吉他时我也踩过不少坑，愿意用循序渐进的方式陪你练会第一首歌。',
  },
  {
    id: 3,
    name: '安然',
    initial: '然',
    avatar: 'violet',
    status: '单向符合',
    canTeach: '手机摄影',
    canGoal: '用自然光记录日常',
    wants: '剪辑入门',
    wantsGoal: '做出一支 30 秒生活短片',
    method: '线上 / 北京同城',
    time: '工作日晚上',
    reasons: ['她能教你手机摄影', '学习目标和你的需求相近', '可在线上完成第一堂课', '她期待交换剪辑技能'],
    note: '喜欢在散步时观察光影，也很乐意把好用的手机拍摄小技巧分享给你。',
  },
]

function Icon({ name }: { name: 'spark' | 'arrow' | 'close' | 'check' | 'calendar' | 'video' | 'bolt' }) {
  const paths = {
    spark: <path d="m12 3 1.85 5.15L19 10l-5.15 1.85L12 17l-1.85-5.15L5 10l5.15-1.85L12 3Zm6 12 .9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9L18 15Z" />,
    arrow: <path d="M5 12h13m-5-5 5 5-5 5" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    check: <path d="m5 12 4.2 4L19 7" />,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4m8-4v4M4 10h16" /></>,
    video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
    bolt: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function Tag({ children, kind = 'plain' }: { children: React.ReactNode; kind?: string }) {
  return <span className={`tag ${kind}`}>{children}</span>
}

function App() {
  const [detail, setDetail] = useState<Partner | null>(null)
  const [invite, setInvite] = useState<Partner | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setDetail(null); setInvite(null); setSuccess(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const openInvite = (partner: Partner) => { setDetail(null); setInvite(partner); setSuccess(false) }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="换一课首页">
          <span className="brand-mark"><Icon name="spark" /></span>
          <span>换一课</span><small>SkillSwap</small>
        </a>
        <nav aria-label="主导航">
          <a className="active" href="#matches">发现互换</a>
          <a href="#need">我的互换</a>
          <a href="#need">我的技能</a>
        </nav>
        <button className="publish" onClick={() => alert('发布技能功能将在下一版开放。')}><span>＋</span> 发布技能</button>
      </header>

      <main id="top">
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">Skill exchange, made human</p>
          <h1 id="page-title">用你会的，换你想学的。</h1>
          <p>找到技能互补的人，交换一堂真正想学的课。</p>
        </section>

        <section className="need-card" id="need" aria-labelledby="need-title">
          <div className="need-heading">
            <div><p className="section-kicker">YOUR EXCHANGE</p><h2 id="need-title">我的互换需求</h2></div>
            <button className="text-button" onClick={() => alert('演示版已为你填入默认需求。')}><span>✎</span> 修改需求</button>
          </div>
          <div className="exchange-grid">
            <article className="skill-side teach-side">
              <div className="side-title"><span className="mini-icon mint"><Icon name="bolt" /></span> 我能教</div>
              <h3>Python 入门</h3>
              <p>用 Python 自动整理一份 Excel 表格</p>
            </article>
            <div className="swap-token" aria-label="互换"><Icon name="arrow" /></div>
            <article className="skill-side learn-side">
              <div className="side-title"><span className="mini-icon peach"><Icon name="spark" /></span> 我想学</div>
              <h3>手机摄影</h3>
              <p>学会基础构图，拍出一张自然的人像</p>
            </article>
            <div className="need-meta"><span><Icon name="video" />线上</span><span><Icon name="calendar" />工作日晚上</span></div>
          </div>
        </section>

        <section className="matches" id="matches" aria-labelledby="match-title">
          <div className="match-heading"><div><p className="section-kicker">FOR YOU</p><h2 id="match-title">推荐交换伙伴</h2><p>不是模糊的分数，而是看得见的互补。</p></div><div className="count-chip"><span>3</span> 位伙伴</div></div>
          <div className="partner-grid">
            {partners.map((partner) => (
              <article className="partner-card" key={partner.id}>
                <header className="partner-head">
                  <div className={`avatar ${partner.avatar}`}>{partner.initial}</div>
                  <div><h3>{partner.name}</h3><p>{partner.note}</p></div>
                  <Tag kind={partner.status === '双向匹配' ? 'mutual' : partner.status === '时间待协商' ? 'pending' : 'oneway'}>{partner.status}</Tag>
                </header>
                <div className="lesson-pair">
                  <div><span className="lesson-label">她能教</span><strong>{partner.canTeach}</strong><p>{partner.canGoal}</p></div>
                  <div><span className="lesson-label">她想学</span><strong>{partner.wants}</strong><p>{partner.wantsGoal}</p></div>
                </div>
                <div className="availability"><span><Icon name="video" />{partner.method}</span><span><Icon name="calendar" />{partner.time}</span></div>
                <div className="why"><h4>{partner.status === '双向匹配' ? '为什么推荐给你' : '符合你的地方'}</h4><ul>{partner.reasons.map((reason) => <li key={reason}><Icon name="check" />{reason}</li>)}</ul></div>
                <footer><button className="secondary" onClick={() => setDetail(partner)}>查看详情 <Icon name="arrow" /></button><button className="primary" onClick={() => openInvite(partner)}>发起互换</button></footer>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="site-footer"><span className="brand-mark small"><Icon name="spark" /></span><span>换一课 · 把会的变成彼此的下一课</span><span>© 2026 SkillSwap</span></footer>

      {detail && <div className="overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setDetail(null)}>
        <section className="modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
          <button className="modal-close" onClick={() => setDetail(null)} aria-label="关闭"><Icon name="close" /></button>
          <div className="modal-person"><div className={`avatar large ${detail.avatar}`}>{detail.initial}</div><div><Tag kind={detail.status === '双向匹配' ? 'mutual' : detail.status === '时间待协商' ? 'pending' : 'oneway'}>{detail.status}</Tag><h2 id="detail-title">和 {detail.name} 换一课</h2><p>{detail.note}</p></div></div>
          <div className="modal-exchange"><div><span>对方能教</span><strong>{detail.canTeach}</strong><p>{detail.canGoal}</p></div><div className="modal-arrow"><Icon name="arrow" /></div><div><span>对方想学</span><strong>{detail.wants}</strong><p>{detail.wantsGoal}</p></div></div>
          <div className="modal-facts"><div><Icon name="video" /><span>方式</span><strong>{detail.method}</strong></div><div><Icon name="calendar" /><span>时间</span><strong>{detail.time}</strong></div></div>
          <div className="why modal-why"><h4>为什么匹配</h4><ul>{detail.reasons.map((reason) => <li key={reason}><Icon name="check" />{reason}</li>)}</ul></div>
          <button className="primary modal-action" onClick={() => openInvite(detail)}>发起互换</button>
        </section>
      </div>}

      {invite && <div className="overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setInvite(null)}>
        <section className="modal invite-modal" role="dialog" aria-modal="true" aria-labelledby="invite-title">
          <button className="modal-close" onClick={() => setInvite(null)} aria-label="关闭"><Icon name="close" /></button>
          {!success ? <><div className="modal-top-icon"><Icon name="spark" /></div><p className="section-kicker">READY TO SWAP</p><h2 id="invite-title">向 {invite.name} 发起互换</h2><p className="invite-intro">确认后会把这份邀请发送给对方。</p><div className="invite-copy">我想向你学习{invite.canTeach}，也可以教你用 Python 整理表格。建议线上互换，双方各 30 分钟。</div><div className="modal-buttons"><button className="secondary plain" onClick={() => setInvite(null)}>暂不发送</button><button className="primary" onClick={() => setSuccess(true)}>确认发起</button></div></> : <><div className="success-icon"><Icon name="check" /></div><h2 id="invite-title">互换邀请已创建</h2><p className="success-copy">等待 {invite.name} 确认。收到回复后，我们会为你准备下一步安排。</p><button className="primary full" onClick={() => setInvite(null)}>知道了</button></>}
        </section>
      </div>}
    </div>
  )
}

export default App
