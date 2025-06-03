'use client';

import {useEffect, useRef, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Play, Pause, RotateCcw, Eye, EyeOff} from 'lucide-react';

interface EasingVisualizerProps {
    config: {
        color1: string;
        color2: string;
        duration: number;
        easing: string;
        waveDelay: number;
    };
    customBezier: string;
    isAnimating: boolean;
}

export function EasingVisualizer({config, customBezier, isAnimating}: EasingVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>();
    const startTimeRef = useRef<number>(0);
    const [localProgress, setLocalProgress] = useState(0);
    const [isLocalAnimating, setIsLocalAnimating] = useState(false);
    const [canvasSize, setCanvasSize] = useState(400);
    const [showControlPoints, setShowControlPoints] = useState(true);

    // ベジェ曲線のパラメータを解析
    const parseBezierParams = (bezierStr: string) => {
        const match = bezierStr.match(/cubic-bezier\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/);
        if (match) {
            return {
                x1: parseFloat(match[1]),
                y1: parseFloat(match[2]),
                x2: parseFloat(match[3]),
                y2: parseFloat(match[4])
            };
        }
        return {x1: 0.25, y1: 0.1, x2: 0.25, y2: 1};
    };

    // 正確なイージング関数の実装
    const getEasingFunction = (type: string) => {
        switch (type) {
            case 'linear':
                return (t: number) => t;

            case 'easeIn':
                return (t: number) => t * t;

            case 'easeOut':
                return (t: number) => 1 - Math.pow(1 - t, 2);

            case 'easeInOut':
                return (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

            case 'easeInQuad':
                return (t: number) => t * t;

            case 'easeOutQuad':
                return (t: number) => 1 - Math.pow(1 - t, 2);

            case 'easeInOutQuad':
                return (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

            case 'easeInCubic':
                return (t: number) => t * t * t;

            case 'easeOutCubic':
                return (t: number) => 1 - Math.pow(1 - t, 3);

            case 'easeInOutCubic':
                return (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            case 'bezier':
                return (t: number) => {
                    const params = parseBezierParams(customBezier);
                    return cubicBezier(params.x1, params.y1, params.x2, params.y2)(t);
                };

            default:
                return (t: number) => t;
        }
    };

    // 3次ベジェ曲線の実装
    const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
        return (t: number) => {
            const cx = 3 * x1;
            const bx = 3 * (x2 - x1) - cx;
            const ax = 1 - cx - bx;

            const cy = 3 * y1;
            const by = 3 * (y2 - y1) - cy;
            const ay = 1 - cy - by;

            // Newton-Raphson法でtからxを逆算
            let time = t;
            for (let i = 0; i < 4; i++) {
                const currentX = ((ax * time + bx) * time + cx) * time;
                const currentSlope = (3 * ax * time + 2 * bx) * time + cx;
                if (Math.abs(currentSlope) < 1e-7) break;
                time -= (currentX - t) / currentSlope;
            }

            return ((ay * time + by) * time + cy) * time;
        };
    };

    // ベジェ制御点を描画
    const drawBezierControlPoints = (ctx: CanvasRenderingContext2D, padding: number, graphSize: number) => {
        if (config.easing !== 'bezier' || !showControlPoints) return;

        const params = parseBezierParams(customBezier);

        // アンカーポイント（開始点と終了点）
        const startX = padding;
        const startY = padding + graphSize;
        const endX = padding + graphSize;
        const endY = padding;

        // 制御点の座標計算
        const cp1X = padding + params.x1 * graphSize;
        const cp1Y = padding + graphSize - params.y1 * graphSize;
        const cp2X = padding + params.x2 * graphSize;
        const cp2Y = padding + graphSize - params.y2 * graphSize;

        // 制御線を描画
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        // 開始点から制御点1への線
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(cp1X, cp1Y);
        ctx.stroke();

        // 終了点から制御点2への線
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(cp2X, cp2Y);
        ctx.stroke();

        ctx.setLineDash([]);

        // アンカーポイントを描画
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(startX, startY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(endX, endY, 8, 0, Math.PI * 2);
        ctx.fill();

        // 制御点を描画
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(cp1X, cp1Y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cp2X, cp2Y, 6, 0, Math.PI * 2);
        ctx.fill();

        // 制御点のラベル
        ctx.fillStyle = '#f59e0b';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('P1', cp1X, cp1Y - 12);
        ctx.fillText('P2', cp2X, cp2Y - 12);

        // アンカーポイントのラベル
        ctx.fillStyle = '#10b981';
        ctx.fillText('Start', startX, startY + 20);
        ctx.fillText('End', endX, endY + 20);

        // 制御点の座標値を表示
        ctx.fillStyle = '#fbbf24';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`P1: (${params.x1.toFixed(2)}, ${params.y1.toFixed(2)})`, padding + 10, padding + 55);
        ctx.fillText(`P2: (${params.x2.toFixed(2)}, ${params.y2.toFixed(2)})`, padding + 10, padding + 70);
    };

    // キャンバス描画
    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 正方形のサイズを使用
        const size = canvasSize;
        const padding = 50;
        const graphSize = size - padding * 2;

        // 背景をクリア
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, size, size);

        // グリッドを描画
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);

        // 縦線と横線（正方形グリッド）
        for (let i = 0; i <= 10; i++) {
            const pos = padding + (graphSize * i) / 10;

            // 縦線
            ctx.beginPath();
            ctx.moveTo(pos, padding);
            ctx.lineTo(pos, padding + graphSize);
            ctx.stroke();

            // 横線
            ctx.beginPath();
            ctx.moveTo(padding, pos);
            ctx.lineTo(padding + graphSize, pos);
            ctx.stroke();
        }

        ctx.setLineDash([]);

        // 軸の描画
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;

        // X軸
        ctx.beginPath();
        ctx.moveTo(padding, padding + graphSize);
        ctx.lineTo(padding + graphSize, padding + graphSize);
        ctx.stroke();

        // Y軸
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, padding + graphSize);
        ctx.stroke();

        // 軸ラベル
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Time', padding + graphSize / 2, size - 15);

        ctx.save();
        ctx.translate(20, padding + graphSize / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Progress', 0, 0);
        ctx.restore();

        // 目盛り
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';

        for (let i = 0; i <= 10; i++) {
            const x = padding + (graphSize * i) / 10;
            ctx.fillText((i / 10).toFixed(1), x, size - 25);
        }

        ctx.textAlign = 'right';
        for (let i = 0; i <= 10; i++) {
            const y = padding + graphSize - (graphSize * i) / 10;
            ctx.fillText((i / 10).toFixed(1), padding - 8, y + 4);
        }

        // ベジェ制御点を描画（曲線の下に）
        if (config.easing === 'bezier' && showControlPoints) {
            drawBezierControlPoints(ctx, padding, graphSize);
        }

        // イージング曲線を描画
        const easingFunc = getEasingFunction(config.easing);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let i = 0; i <= graphSize; i++) {
            const t = i / graphSize;
            const easedT = easingFunc(t);
            const x = padding + i;
            const y = padding + graphSize - (easedT * graphSize);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // 現在の進行状況を表示
        if (isLocalAnimating || isAnimating) {
            const currentT = localProgress;
            const currentEased = easingFunc(currentT);

            // 進行ドット
            const dotX = padding + currentT * graphSize;
            const dotY = padding + graphSize - (currentEased * graphSize);

            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
            ctx.fill();

            // 進行線
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);

            // 垂直線
            ctx.beginPath();
            ctx.moveTo(dotX, padding + graphSize);
            ctx.lineTo(dotX, dotY);
            ctx.stroke();

            // 水平線
            ctx.beginPath();
            ctx.moveTo(padding, dotY);
            ctx.lineTo(dotX, dotY);
            ctx.stroke();

            ctx.setLineDash([]);

            // 数値表示
            ctx.fillStyle = '#ef4444';
            ctx.font = '12px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`t: ${currentT.toFixed(3)}`, padding + 10, padding + 20);
            ctx.fillText(`f(t): ${currentEased.toFixed(3)}`, padding + 10, padding + 35);
        }

        // イージング関数名を表示
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        const easingName = config.easing === 'bezier' ?
            `Bezier: ${customBezier.length > 30 ? customBezier.substring(0, 30) + '...' : customBezier}` :
            config.easing.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        ctx.fillText(easingName, padding + graphSize / 2, padding - 15);
    };

    // ローカルアニメーション制御
    const startLocalAnimation = () => {
        setIsLocalAnimating(true);
        startTimeRef.current = performance.now();
    };

    const stopLocalAnimation = () => {
        setIsLocalAnimating(false);
        setLocalProgress(0);
    };

    const resetLocalAnimation = () => {
        setIsLocalAnimating(false);
        setLocalProgress(0);
    };

    // キャンバスサイズの計算と更新
    const updateCanvasSize = () => {
        if (!containerRef.current) return;

        const containerWidth = containerRef.current.clientWidth;
        // 最大サイズを制限し、最小サイズを保証
        const size = Math.max(300, Math.min(containerWidth - 40, 600));
        setCanvasSize(size);
    };

    // アニメーションループ
    useEffect(() => {
        if (isLocalAnimating || isAnimating) {
            const animate = (currentTime: number) => {
                if (startTimeRef.current === 0) {
                    startTimeRef.current = currentTime;
                }

                const elapsed = currentTime - startTimeRef.current;
                const progress = Math.min(elapsed / config.duration, 1);

                setLocalProgress(progress);

                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    setIsLocalAnimating(false);
                    startTimeRef.current = 0;
                }
            };

            animationRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isLocalAnimating, isAnimating, config.duration]);

    // 外部アニメーション状態の同期
    useEffect(() => {
        if (isAnimating && !isLocalAnimating) {
            startLocalAnimation();
        } else if (!isAnimating && isLocalAnimating) {
            stopLocalAnimation();
        }
    }, [isAnimating]);

    // 描画更新
    useEffect(() => {
        draw();
    }, [config, customBezier, localProgress, isLocalAnimating, isAnimating, canvasSize, showControlPoints]);

    // キャンバスのリサイズ対応
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            updateCanvasSize();
            // devicePixelRatioを考慮して高解像度対応
            canvas.width = canvasSize * window.devicePixelRatio;
            canvas.height = canvasSize * window.devicePixelRatio;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            }
            draw();
        };

        // 初期サイズ設定
        updateCanvasSize();
        resizeCanvas();

        // リサイズイベント
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [canvasSize]);

    return (
        <div ref={containerRef} className="space-y-4">
            {/* 正方形キャンバスコンテナ */}
            <div className="flex justify-center">
                <canvas
                    ref={canvasRef}
                    className="border rounded-lg bg-slate-900 shadow-lg"
                    style={{
                        width: `${canvasSize}px`,
                        height: `${canvasSize}px`,
                        maxWidth: '100%'
                    }}
                />
            </div>

            {/* コントロールボタン */}
            <div className="flex gap-2 justify-center flex-wrap">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={isLocalAnimating ? stopLocalAnimation : startLocalAnimation}
                    disabled={isAnimating}
                >
                    {isLocalAnimating ? <Pause className="w-4 h-4 mr-2"/> : <Play className="w-4 h-4 mr-2"/>}
                    {isLocalAnimating ? 'Pause' : 'Play'}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={resetLocalAnimation}
                    disabled={isAnimating}
                >
                    <RotateCcw className="w-4 h-4 mr-2"/>
                    Reset
                </Button>

                {/* ベジェ曲線の場合のみ制御点表示切り替えボタンを表示 */}
                {config.easing === 'bezier' && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowControlPoints(!showControlPoints)}
                    >
                        {showControlPoints ? <EyeOff className="w-4 h-4 mr-2"/> : <Eye className="w-4 h-4 mr-2"/>}
                        制御点
                    </Button>
                )}
            </div>

            {/* 情報表示 */}
            <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-3 rounded-lg">
                <div className="font-medium mb-2">イージング情報</div>
                <div>関数: {config.easing === 'bezier' ? customBezier : config.easing}</div>
                <div>継続時間: {config.duration}ms</div>
                <div>現在の進行: {(localProgress * 100).toFixed(1)}%</div>
                <div>現在の値: {getEasingFunction(config.easing)(localProgress).toFixed(3)}</div>
                <div className="text-muted-foreground/70">Canvas: {canvasSize}×{canvasSize}px</div>

                {/* ベジェ曲線の場合のみ制御点情報を表示 */}
                {config.easing === 'bezier' && showControlPoints && (
                    <div className="mt-3 pt-2 border-t border-muted-foreground/20">
                        <div className="font-medium mb-1">制御点情報</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span>アンカーポイント</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <span>制御点</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}