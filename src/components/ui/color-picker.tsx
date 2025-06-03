'use client';

import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Palette, RotateCcw } from 'lucide-react';

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
    label?: string;
    disabled?: boolean;
    showPresets?: boolean;
    showEyeDropper?: boolean;
    className?: string;
}

// LED用プリセットカラー
const LED_PRESETS = [
    { name: 'Red', color: '#FF0000' },
    { name: 'Green', color: '#00FF00' },
    { name: 'Blue', color: '#0000FF' },
    { name: 'Yellow', color: '#FFFF00' },
    { name: 'Cyan', color: '#00FFFF' },
    { name: 'Magenta', color: '#FF00FF' },
    { name: 'Orange', color: '#FFA500' },
    { name: 'Purple', color: '#800080' },
    { name: 'Pink', color: '#FF69B4' },
    { name: 'Lime', color: '#32CD32' },
    { name: 'Sky Blue', color: '#87CEEB' },
    { name: 'White', color: '#FFFFFF' },
    { name: 'Warm White', color: '#FFF8DC' },
    { name: 'Cool White', color: '#F0F8FF' },
    { name: 'Amber', color: '#FFBF00' },
    { name: 'Deep Blue', color: '#002bff' }
];

// 暖色・寒色パレット
const WARM_COLORS = ['#FF6B6B', '#FF8E53', '#FF6B35', '#F7931E', '#FFD23F', '#FFF1AC'];
const COOL_COLORS = ['#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#A8E6CF'];

// HEXカラーのバリデーション
const isValidHex = (hex: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
};

// 3桁HEXを6桁に変換
const normalizeHex = (hex: string): string => {
    if (hex.length === 4) {
        return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    return hex;
};

export function ColorPicker({
    color,
    onChange,
    label,
    disabled = false,
    showPresets = true,
    showEyeDropper = true,
    className = ''
}: ColorPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(color);
    const [pickerColor, setPickerColor] = useState(color);
    const eyeDropperRef = useRef<any>(null);

    // 色が外部から変更された時の同期
    useEffect(() => {
        setInputValue(color);
        setPickerColor(color);
    }, [color]);

    // カラーピッカーからの変更処理
    const handlePickerChange = (newColor: string) => {
        setPickerColor(newColor);
        setInputValue(newColor);
        onChange(newColor);
    };

    // HEX入力の変更処理
    const handleInputChange = (value: string) => {
        setInputValue(value);

        // HEXカラーとして有効な場合のみ更新
        if (isValidHex(value)) {
            const normalizedColor = normalizeHex(value);
            setPickerColor(normalizedColor);
            onChange(normalizedColor);
        }
    };

    // 入力フィールドのフォーカスが外れたときの処理
    const handleInputBlur = () => {
        if (!isValidHex(inputValue)) {
            setInputValue(color); // 無効な場合は元の色に戻す
        }
    };

    // プリセットカラーの選択
    const handlePresetSelect = (presetColor: string) => {
        setPickerColor(presetColor);
        setInputValue(presetColor);
        onChange(presetColor);
        setIsOpen(false); // プリセット選択後はポップオーバーを閉じる
    };

    // スポイト機能
    const handleEyeDropper = async () => {
        if (!('EyeDropper' in window)) {
            alert('お使いのブラウザではスポイト機能がサポートされていません');
            return;
        }

        try {
            const eyeDropper = new (window as any).EyeDropper();
            const result = await eyeDropper.open();
            handlePresetSelect(result.sRGBHex);
        } catch (error) {
            console.log('スポイト機能がキャンセルされました');
        }
    };

    // ランダムカラー生成
    const generateRandomColor = () => {
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()}`;
        handlePresetSelect(randomColor);
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && <Label>{label}</Label>}

            <div className="flex gap-2">
                <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onBlur={handleInputBlur}
                    disabled={disabled}
                    className="flex-1 font-mono"
                    placeholder="#000000"
                />

                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={disabled}
                            className="w-12 h-10 p-1 border-2"
                            style={{ backgroundColor: color }}
                        >
                            <Palette className="w-4 h-4" style={{ color: getContrastColor(color) }} />
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-80 p-4" align="start">
                        <Tabs defaultValue="picker" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="picker">カラーピッカー</TabsTrigger>
                                <TabsTrigger value="presets">プリセット</TabsTrigger>
                            </TabsList>

                            <TabsContent value="picker" className="space-y-4">
                                <div className="space-y-3">
                                    <HexColorPicker
                                        color={pickerColor}
                                        onChange={handlePickerChange}
                                        className="w-full"
                                    />

                                    <div className="flex gap-2">
                                        {showEyeDropper && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleEyeDropper}
                                                className="flex-1"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                スポイト
                                            </Button>
                                        )}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={generateRandomColor}
                                            className="flex-1"
                                        >
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            ランダム
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="presets" className="space-y-4">
                                {showPresets && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium mb-2 block">LEDプリセット</Label>
                                            <div className="grid grid-cols-8 gap-1">
                                                {LED_PRESETS.map((preset) => (
                                                    <Button
                                                        key={preset.name}
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-8 h-8 p-0 border-2 hover:scale-110 transition-transform"
                                                        style={{ backgroundColor: preset.color }}
                                                        onClick={() => handlePresetSelect(preset.color)}
                                                        title={`${preset.name} (${preset.color})`}
                                                    >
                                                        <span className="sr-only">{preset.name}</span>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium mb-2 block">暖色系</Label>
                                            <div className="grid grid-cols-6 gap-1">
                                                {WARM_COLORS.map((warmColor, index) => (
                                                    <Button
                                                        key={index}
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-8 h-8 p-0 border-2 hover:scale-110 transition-transform"
                                                        style={{ backgroundColor: warmColor }}
                                                        onClick={() => handlePresetSelect(warmColor)}
                                                        title={warmColor}
                                                    >
                                                        <span className="sr-only">{warmColor}</span>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium mb-2 block">寒色系</Label>
                                            <div className="grid grid-cols-6 gap-1">
                                                {COOL_COLORS.map((coolColor, index) => (
                                                    <Button
                                                        key={index}
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-8 h-8 p-0 border-2 hover:scale-110 transition-transform"
                                                        style={{ backgroundColor: coolColor }}
                                                        onClick={() => handlePresetSelect(coolColor)}
                                                        title={coolColor}
                                                    >
                                                        <span className="sr-only">{coolColor}</span>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </PopoverContent>
                </Popover>
            </div>

            {/* カラープレビュー */}
            <div
                className="w-full h-8 rounded border-2 shadow-inner transition-colors duration-200"
                style={{ backgroundColor: color }}
                title={`現在の色: ${color}`}
            />
        </div>
    );
}

// コントラスト色の計算（アイコンの視認性向上）
function getContrastColor(hexColor: string): string {
    if (!hexColor || hexColor.length < 7) return '#000000';

    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
}