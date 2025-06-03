'use client';

import {useState} from 'react';
import {toast} from '@/hooks/use-toast';
import {useArduinoConnection} from '@/hooks/use-arduino-connection';
import {ConnectionSettings} from '@/components/connection-settings';
import {ColorSettings} from '@/components/color-settings';
import {AnimationSettings} from '@/components/animation-settings';
import {ControlPanel} from '@/components/control-panel';
import {EasingVisualizer} from '@/components/easing-visualizer';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

interface AnimationConfig {
    color1: string;
    color2: string;
    duration: number;
    easing: string;
    waveDelay: number;
}

export default function Home() {
    // Arduino接続設定
    const [arduinoIp, setArduinoIp] = useState('192.168.11.105');
    const {isConnected, isSending, sendRequest} = useArduinoConnection(arduinoIp);

    // アニメーション設定
    const [config, setConfig] = useState<AnimationConfig>({
        color1: '#002bff',
        color2: '#00FF00',
        duration: 5000,
        easing: 'linear',
        waveDelay: 0.1
    });

    const [customBezier, setCustomBezier] = useState('cubic-bezier(0.68, -0.55, 0.265, 1.55)');
    const [isAnimating, setIsAnimating] = useState(false);

    // 設定送信
    const sendConfig = async () => {
        try {
            const requestBody = {
                color1: config.color1,
                color2: config.color2,
                duration: config.duration,
                easing: config.easing,
                waveDelay: config.waveDelay,
                ...(config.easing === 'bezier' && {bezier: customBezier})
            };

            await sendRequest('/api/config', requestBody);

            toast({
                title: "設定送信完了",
                description: `Arduino (${arduinoIp}) に設定を送信しました`
            });
        } catch (error) {
            toast({
                title: "エラー",
                description: `設定の送信に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
                variant: "destructive"
            });
        }
    };

    // アニメーション開始
    const startAnimation = async () => {
        try {
            await sendRequest('/api/start');
            setIsAnimating(true);

            toast({
                title: "アニメーション開始",
                description: "LEDアニメーションを開始しました"
            });

            // アニメーション時間後に自動で停止状態にする
            setTimeout(() => {
                setIsAnimating(false);
            }, config.duration);
        } catch (error) {
            toast({
                title: "エラー",
                description: `アニメーションの開始に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
                variant: "destructive"
            });
        }
    };

    // アニメーション停止
    const stopAnimation = async () => {
        try {
            await sendRequest('/api/stop');
            setIsAnimating(false);

            toast({
                title: "アニメーション停止",
                description: "LEDアニメーションを停止しました"
            });
        } catch (error) {
            toast({
                title: "エラー",
                description: `アニメーションの停止に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
                variant: "destructive"
            });
        }
    };

    // 設定リセット
    const resetConfig = () => {
        setConfig({
            color1: '#002bff',
            color2: '#00FF00',
            duration: 5000,
            easing: 'linear',
            waveDelay: 0.1
        });
        setCustomBezier('cubic-bezier(0.68, -0.55, 0.265, 1.55)');
        setArduinoIp('192.168.11.105');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* ヘッダー */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">Arduino LED Controller</h1>
                    <p className="text-muted-foreground">イージング関数を用いたLEDアニメーション制御</p>
                </div>

                {/* 上段: 接続設定と制御パネル */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ConnectionSettings
                        arduinoIp={arduinoIp}
                        onIpChange={setArduinoIp}
                        isConnected={isConnected}
                    />

                    <ControlPanel
                        isAnimating={isAnimating}
                        isConnected={isConnected}
                        isSending={isSending}
                        onSendConfig={sendConfig}
                        onStartAnimation={startAnimation}
                        onStopAnimation={stopAnimation}
                        onReset={resetConfig}
                    />
                </div>

                {/* 中段: カラー設定とアニメーション設定 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ColorSettings
                        color1={config.color1}
                        color2={config.color2}
                        onColor1Change={(color) => setConfig(prev => ({...prev, color1: color}))}
                        onColor2Change={(color) => setConfig(prev => ({...prev, color2: color}))}
                    />

                    <AnimationSettings
                        duration={config.duration}
                        easing={config.easing}
                        customBezier={customBezier}
                        waveDelay={config.waveDelay}
                        onDurationChange={(duration) => setConfig(prev => ({...prev, duration}))}
                        onEasingChange={(easing) => setConfig(prev => ({...prev, easing}))}
                        onCustomBezierChange={setCustomBezier}
                        onWaveDelayChange={(waveDelay) => setConfig(prev => ({...prev, waveDelay}))}
                    />
                </div>

                {/* 下段: プレビュー（全幅） */}
                <div className="w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>アニメーションプレビュー</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EasingVisualizer
                                config={config}
                                customBezier={customBezier}
                                isAnimating={isAnimating}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}