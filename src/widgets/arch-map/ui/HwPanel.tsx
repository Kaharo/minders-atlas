import { Fragment } from 'react';
import type { HwData } from './ArchMap';
import s from './HwPanel.module.css';

/** «Где помещается»: лестница устройств, серверы с GPU, строки памяти. */
export function HwPanel({ hw }: { hw: HwData }) {
  return (
    <div className={s.panel}>
      <span className={s.kicker}>Где помещается</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span className={s.head}>{hw.head}</span>
        <span className={s.sub}>{hw.sub}</span>
      </div>
      <div className={s.ladder}>
        {hw.ladder.map(h => (
          <div key={h.name} className={s.rung} title={h.tip} style={{ background: h.on ? (h.hid ? 'rgba(14,18,48,0.55)' : '#0b0b14') : 'transparent', boxShadow: h.on ? '0 1px 3px rgba(16,24,64,0.2)' : 'none' }}>
            <span style={{ fontWeight: h.on ? 600 : 500, color: h.on ? '#fff' : h.ok ? '#22263a' : '#b3b8c7' }}>{h.name}</span>
            <span style={{ color: h.on ? 'rgba(255,255,255,0.65)' : h.ok ? '#8a90a6' : '#c9ccd6' }}>{h.cap}</span>
          </div>
        ))}
      </div>
      {hw.servers.map(sv => (
        <div key={sv.name} className={s.srv}>
          <div className={s.srvHead}><span>{sv.name}</span><span>{sv.sub}</span></div>
          <div className={s.gpus}>
            {sv.gpus.map((g, i) => (
              <span key={i} className={s.gpu} title={g.tip} style={{ background: g.used ? '#fff' : 'transparent', border: `1px ${g.used ? 'solid' : 'dashed'} rgba(14,18,48,${g.used ? 0.14 : 0.16})` }}>
                {g.used && <><i style={{ height: g.w + '%' }} /><b style={{ bottom: g.w + '%' }} /></>}
              </span>
            ))}
          </div>
        </div>
      ))}
      {hw.more && <span className={s.more}>{hw.more}</span>}
      {hw.dev && (
        <div className={s.srv}>
          <div className={s.srvHead}><span>{hw.dev.name}</span><span>{hw.dev.cap}</span></div>
          <div className={s.bar}><i style={{ width: hw.dev.w + '%' }} /></div>
        </div>
      )}
      {!hw.hid && <div className={s.legend}><span><i style={{ background: 'hsl(228,55%,62%)' }} />веса</span><span><i style={{ background: 'hsl(275,60%,86%)' }} />свободно под KV-кэш</span></div>}
      <dl className={s.rows}>{hw.rows.map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl>
    </div>
  );
}
