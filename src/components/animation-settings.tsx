'use client';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Slider} from '@/components/ui/slider';
import {Button} from '@/components/ui/button';
import {Clock, Zap, Waves, RotateCcw} from 'lucide-react';

interface BezierValues {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

interface AnimationSettingsProps {
    duration: number;
    easing: string;
    customBezier: string;
    waveDelay: number;
    onDurationChange: (duration: number) => void;
    onEasingChange: (easing: string) => void;
    onCustomBezierChange: (bezier: string) => void;
    onWaveDelayChange: (waveDelay: number) => void;
}

const EASING_OPTIONS = [
    {value: 'linear', label: 'Linear'},
    {value: 'easeIn', label: 'Ease In'},
    {value: 'easeOut', label: 'Ease Out'},
    {value: 'easeInOut', label: 'Ease In Out'},
    {value: 'easeInQuad', label: 'Ease In Quad'},
    {value: 'easeOutQuad', label: 'Ease Out Quad'},
    {value: 'easeInOutQuad', label: 'Ease In Out Quad'},
    {value: 'easeInCubic', label: 'Ease In Cubic'},
    {value: 'easeOutCubic', label: 'Ease Out Cubic'},
    {value: 'easeInOutCubic', label: 'Ease In Out Cubic'},
    {value: 'bezier', label: 'Custom Bezier'}
];

// 人気のベジェ曲線プリセット
const BEZIER_PRESETS = [
    {name: 'Ease', values: {x1: 0.25, y1: 0.1, x2: 0.25, y2: 1}},
    {name: 'Ease In', values: {x1: 0.42, y1: 0, x2: 1, y2: 1}},
    {name: 'Ease Out', values: {x1: 0, y1: 0, x2: 0.58, y2: 1}},
    {name: 'Ease In Out', values: {x1: 0.42, y1: 0, x2: 0.58, y2: 1}},
    {name: 'Bounce', values: {x1: 0.68, y1: -0.55, x2: 0.265, y2: 1.55}},
    {name: 'Elastic', values: {x1: 0.175, y1: 0.885, x2: 0.32, y2: 1.275}}
];

export function AnimationSettings({
                                      duration,
                                      easing,
                                      customBezier,
                                      waveDelay,
                                      onDurationChange,
                                      onEasingChange,
                                      onCustomBezierChange,
                                      onWaveDelayChange
                                  }: AnimationSettingsProps) {
    // ベジェ曲線の文字列をパース
    const parseBezierString = (bezierStr: string): BezierValues => {
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

    // ベジェ値から文字列を生成
    const formatBezierString = (values: BezierValues): string => {
        return `cubic-bezier(${values.x1}, ${values.y1}, ${values.x2}, ${values.y2})`;
    };

    const bezierValues = parseBezierString(customBezier);

    // 個別のベジェ値更新
    const updateBezierValue = (key: keyof BezierValues, value: number) => {
        const newValues = {...bezierValues, [key]: value};
        onCustomBezierChange(formatBezierString(newValues));
    };

    // プリセット適用
    const applyBezierPreset = (preset: typeof BEZIER_PRESETS[0]) => {
        onCustomBezierChange(formatBezierString(preset.values));
    };

    // 継続時間をフォーマット（秒表示）
    const formatDuration = (ms: number) => {
        return `${(ms / 1000).toFixed(1)}秒`;
    };

    // ウェーブ遅延をフォーマット（ミリ秒表示）
    const formatWaveDelay = (delay: number) => {
        return `${(delay * 1000).toFixed(0)}ms`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5"/>
                    アニメーション設定
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* 継続時間設定 */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4"/>
                        <Label>継続時間: {formatDuration(duration)}</Label>
                    </div>
                    <Slider
                        value={[duration]}
                        onValueChange={(value) => onDurationChange(value[0])}
                        min={500}
                        max={10000}
                        step={100}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0.5秒</span>
                        <span>10秒</span>
                    </div>
                </div>

                {/* ウェーブ遅延設定 */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Waves className="w-4 h-4"/>
                        <Label>ウェーブ遅延: {formatWaveDelay(waveDelay)}</Label>
                    </div>
                    <Slider
                        value={[waveDelay]}
                        onValueChange={(value) => onWaveDelayChange(value[0])}
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0ms (同期)</span>
                        <span>1000ms (最大遅延)</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        LEDストリップ上での波のような効果の遅延時間を設定します
                    </p>
                </div>

                {/* イージング設定 */}
                <div className="space-y-3">
                    <Label>イージング関数</Label>
                    <Select value={easing} onValueChange={onEasingChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="イージング関数を選択"/>
                        </SelectTrigger>
                        <SelectContent>
                            {EASING_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* カスタムベジェ設定 */}
                {easing === 'bezier' && (
                    <div className="space-y-4">
                        <Label className="text-base font-medium">ベジェ曲線設定</Label>

                        {/* 制御点1 */}
                        <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                            <Label className="text-sm font-medium">制御点1 (P1)</Label>

                            <div className="space-y-3">
                                <div>
                                    <Label className="text-xs">X1: {bezierValues.x1.toFixed(3)}</Label>
                                    <Slider
                                        value={[bezierValues.x1]}
                                        onValueChange={(value) => updateBezierValue('x1', value[0])}
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs">Y1: {bezierValues.y1.toFixed(3)}</Label>
                                    <Slider
                                        value={[bezierValues.y1]}
                                        onValueChange={(value) => updateBezierValue('y1', value[0])}
                                        min={-2}
                                        max={2}
                                        step={0.01}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    type="number"
                                    placeholder="X1"
                                    value={bezierValues.x1}
                                    onChange={(e) => updateBezierValue('x1', parseFloat(e.target.value) || 0)}
                                    step={0.01}
                                    min={0}
                                    max={1}
                                    className="text-xs"
                                />
                                <Input
                                    type="number"
                                    placeholder="Y1"
                                    value={bezierValues.y1}
                                    onChange={(e) => updateBezierValue('y1', parseFloat(e.target.value) || 0)}
                                    step={0.01}
                                    min={-2}
                                    max={2}
                                    className="text-xs"
                                />
                            </div>
                        </div>

                        {/* 制御点2 */}
                        <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                            <Label className="text-sm font-medium">制御点2 (P2)</Label>

                            <div className="space-y-3">
                                <div>
                                    <Label className="text-xs">X2: {bezierValues.x2.toFixed(3)}</Label>
                                    <Slider
                                        value={[bezierValues.x2]}
                                        onValueChange={(value) => updateBezierValue('x2', value[0])}
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs">Y2: {bezierValues.y2.toFixed(3)}</Label>
                                    <Slider
                                        value={[bezierValues.y2]}
                                        onValueChange={(value) => updateBezierValue('y2', value[0])}
                                        min={-2}
                                        max={2}
                                        step={0.01}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    type="number"
                                    placeholder="X2"
                                    value={bezierValues.x2}
                                    onChange={(e) => updateBezierValue('x2', parseFloat(e.target.value) || 0)}
                                    step={0.01}
                                    min={0}
                                    max={1}
                                    className="text-xs"
                                />
                                <Input
                                    type="number"
                                    placeholder="Y2"
                                    value={bezierValues.y2}
                                    onChange={(e) => updateBezierValue('y2', parseFloat(e.target.value) || 0)}
                                    step={0.01}
                                    min={-2}
                                    max={2}
                                    className="text-xs"
                                />
                            </div>
                        </div>

                        {/* CSS文字列表示 */}
                        <div className="space-y-2">
                            <Label className="text-xs">CSS文字列</Label>
                            <Input
                                value={customBezier}
                                onChange={(e) => onCustomBezierChange(e.target.value)}
                                className="font-mono text-xs"
                                placeholder="cubic-bezier(0.25, 0.1, 0.25, 1)"
                            />
                        </div>

                        {/* リセットボタン */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applyBezierPreset(BEZIER_PRESETS[0])}
                            className="w-full"
                        >
                            <RotateCcw className="w-4 h-4 mr-2"/>
                            デフォルトに戻す
                        </Button>
                    </div>
                )}

                {/* 設定サマリー */}
                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                    <h4 className="text-sm font-medium">アニメーション概要</h4>
                    <div className="text-xs space-y-1">
                        <div>継続時間: {formatDuration(duration)}</div>
                        <div>ウェーブ遅延: {formatWaveDelay(waveDelay)}</div>
                        <div>イージング: {EASING_OPTIONS.find(opt => opt.value === easing)?.label}</div>
                        {easing === 'bezier' && (
                            <>
                                <div className="font-mono">ベジェ: {customBezier}</div>
                                <div className="text-muted-foreground">
                                    P1({bezierValues.x1.toFixed(2)}, {bezierValues.y1.toFixed(2)})
                                    P2({bezierValues.x2.toFixed(2)}, {bezierValues.y2.toFixed(2)})
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}