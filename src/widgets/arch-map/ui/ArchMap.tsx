import { useEffect, useRef, useState } from 'react';
import { ArchScene, type ArchProps } from '../lib/ArchScene';
import { hwInfo } from '../lib/hwInfo';
import s from './ArchMap.module.css';

export type HwData = NonNullable<ReturnType<typeof hwInfo>>;

/**
 * Canvas-карта архитектуры модели. Движок живёт в ArchScene и не перерисовывается React-ом:
 * сюда приходят только props, а наружу уходят клики по точкам/зонам и данные для панели «Где помещается».
 */
export function ArchMap({ onHw, ...props }: ArchProps & { onHw?: (hw: HwData | null) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ArchScene | null>(null);
  const propsRef = useRef(props);
  const onHwRef = useRef(onHw);
  const [cursor, setCursor] = useState('grab');
  propsRef.current = props; onHwRef.current = onHw;

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const scene = new ArchScene(canvas, wrap, propsRef.current);
    sceneRef.current = scene;
    const push = () => { setCursor(scene.state.cursor); onHwRef.current?.(hwInfo(scene)); };
    scene.onState = push;
    push();
    return () => { scene.destroy(); sceneRef.current = null; };
  }, []);

  useEffect(() => { const sc = sceneRef.current; if (sc) { const prevModel = sc.props.modelId; sc.setProps(props); if (prevModel !== props.modelId) onHwRef.current?.(hwInfo(sc)); } });

  return (
    <div ref={wrapRef} className={s.wrap}>
      <canvas ref={canvasRef} className={s.canvas} style={{ cursor }}
        onPointerDown={e => sceneRef.current?.onDown(e.nativeEvent)} onPointerMove={e => sceneRef.current?.onMove(e.nativeEvent)}
        onPointerUp={e => sceneRef.current?.onUp(e.nativeEvent)} onPointerLeave={e => sceneRef.current?.onLeave(e.nativeEvent)} />
    </div>
  );
}
