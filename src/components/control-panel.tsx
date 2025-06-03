'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Play, Pause, RotateCcw, Send, Loader2} from 'lucide-react';

interface ControlPanelProps {
    isAnimating: boolean;
    isConnected: boolean;
    isSending: boolean;
    onSendConfig: () => void;
    onStartAnimation: () => void;
    onStopAnimation: () => void;
    onReset: () => void;
}

export function ControlPanel({
                                 isAnimating,
                                 isConnected,
                                 isSending,
                                 onSendConfig,
                                 onStartAnimation,
                                 onStopAnimation,
                                 onReset
                             }: ControlPanelProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>制御パネル</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        onClick={onSendConfig}
                        disabled={!isConnected || isSending}
                        variant="outline"
                        className="h-12"
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                送信中...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2"/>
                                設定送信
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={isAnimating ? onStopAnimation : onStartAnimation}
                        disabled={!isConnected}
                        className="h-12"
                    >
                        {isAnimating ? (
                            <>
                                <Pause className="w-4 h-4 mr-2"/>
                                停止
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-2"/>
                                開始
                            </>
                        )}
                    </Button>
                </div>

                <Button
                    onClick={onReset}
                    variant="outline"
                    className="w-full"
                    size="sm"
                >
                    <RotateCcw className="w-4 h-4 mr-2"/>
                    設定をリセット
                </Button>

                {!isConnected && (
                    <div className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        ⚠️ Arduino IPアドレスを設定してください
                    </div>
                )}
            </CardContent>
        </Card>
    );
}