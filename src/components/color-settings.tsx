'use client';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {ColorPicker} from '@/components/ui/color-picker';
import {Button} from '@/components/ui/button';
import {Shuffle, Zap} from 'lucide-react';

interface ColorSettingsProps {
    color1: string;
    color2: string;
    onColor1Change: (color: string) => void;
    onColor2Change: (color: string) => void;
}

// LEDアニメーション用の人気カラーコンビネーション
const POPULAR_COMBINATIONS = [
    {name: 'サンセット', color1: '#FF6B6B', color2: '#FFD93D'},
    {name: 'オーシャン', color1: '#6BCF7F', color2: '#4D9DE0'},
    {name: 'ネオン', color1: '#FF00FF', color2: '#00FFFF'},
    {name: 'ファイア', color1: '#FF4500', color2: '#FFD700'},
    {name: 'パープル', color1: '#8A2BE2', color2: '#FF69B4'},
    {name: 'レインボー', color1: '#FF0000', color2: '#00FF00'}
];

export function ColorSettings({color1, color2, onColor1Change, onColor2Change}: ColorSettingsProps) {
    // カラーコンビネーションの適用
    const applyCombination = (combination: typeof POPULAR_COMBINATIONS[0]) => {
        onColor1Change(combination.color1);
        onColor2Change(combination.color2);
    };

    // 色をスワップ
    const swapColors = () => {
        const temp = color1;
        onColor1Change(color2);
        onColor2Change(temp);
    };

    // ランダムな組み合わせ生成
    const generateRandomCombination = () => {
        const randomCombination = POPULAR_COMBINATIONS[Math.floor(Math.random() * POPULAR_COMBINATIONS.length)];
        applyCombination(randomCombination);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5"/>
                    カラー設定
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <ColorPicker
                        color={color1}
                        onChange={onColor1Change}
                        label="開始色"
                        showPresets={true}
                        showEyeDropper={true}
                    />

                    <ColorPicker
                        color={color2}
                        onChange={onColor2Change}
                        label="終了色"
                        showPresets={true}
                        showEyeDropper={true}
                    />
                </div>

                {/* 制御ボタン */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={swapColors}
                        className="flex-1"
                    >
                        <Shuffle className="w-4 h-4 mr-2"/>
                        色を入れ替え
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={generateRandomCombination}
                        className="flex-1"
                    >
                        <Shuffle className="w-4 h-4 mr-2"/>
                        ランダム
                    </Button>
                </div>

                {/* 人気の組み合わせ */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium">人気の組み合わせ</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {POPULAR_COMBINATIONS.map((combination) => (
                            <Button
                                key={combination.name}
                                variant="outline"
                                size="sm"
                                onClick={() => applyCombination(combination)}
                                className="h-12 justify-start p-2"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="flex">
                                        <div
                                            className="w-4 h-4 rounded-l border"
                                            style={{backgroundColor: combination.color1}}
                                        />
                                        <div
                                            className="w-4 h-4 rounded-r border"
                                            style={{backgroundColor: combination.color2}}
                                        />
                                    </div>
                                    <span className="text-xs">{combination.name}</span>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* カラープレビュー */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">グラデーションプレビュー</h4>
                    <div
                        className="w-full h-8 rounded border shadow-inner"
                        style={{
                            background: `linear-gradient(90deg, ${color1} 0%, ${color2} 100%)`
                        }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}