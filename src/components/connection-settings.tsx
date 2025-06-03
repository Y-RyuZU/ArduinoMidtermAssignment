'use client';

import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Wifi, WifiOff} from 'lucide-react';

interface ConnectionSettingsProps {
    arduinoIp: string;
    onIpChange: (ip: string) => void;
    isConnected: boolean;
}

export function ConnectionSettings({arduinoIp, onIpChange, isConnected}: ConnectionSettingsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {isConnected ? (
                        <Wifi className="w-5 h-5 text-green-500"/>
                    ) : (
                        <WifiOff className="w-5 h-5 text-red-500"/>
                    )}
                    Arduino接続設定
                    <Badge variant={isConnected ? "default" : "destructive"}>
                        {isConnected ? "接続済み" : "未接続"}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2">
                    <Label htmlFor="arduino-ip">Arduino IPアドレス</Label>
                    <Input
                        id="arduino-ip"
                        type="text"
                        value={arduinoIp}
                        onChange={(e) => onIpChange(e.target.value)}
                        placeholder="192.168.11.105"
                        className="font-mono"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    <p>ArduinoのIPアドレスを入力してください</p>
                    <p className="text-xs">例: 192.168.1.100, 10.0.0.50</p>
                </div>
            </CardContent>
        </Card>
    );
}