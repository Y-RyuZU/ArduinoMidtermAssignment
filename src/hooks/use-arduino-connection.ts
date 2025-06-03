'use client';

import {useState, useEffect} from 'react';

export function useArduinoConnection(arduinoIp: string) {
    const [isConnected, setIsConnected] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // IPアドレスの妥当性チェック
    const isValidIp = (ip: string) => {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    };

    // 接続状態の更新
    useEffect(() => {
        setIsConnected(isValidIp(arduinoIp));
    }, [arduinoIp]);

    // Arduino APIリクエスト送信
    const sendRequest = async (endpoint: string, data?: any) => {
        if (!isValidIp(arduinoIp)) {
            throw new Error('無効なIPアドレスです');
        }

        setIsSending(true);
        try {
            const response = await fetch(`http://${arduinoIp}${endpoint}`, {
                method: 'POST',
                headers: data ? {'Content-Type': 'application/json'} : undefined,
                body: data ? JSON.stringify(data) : undefined
            });

            if (!response.ok) {
                throw new Error(`HTTPエラー: ${response.status}`);
            }

            return response;
        } finally {
            setIsSending(false);
        }
    };

    return {
        isConnected,
        isSending,
        sendRequest,
        isValidIp: isValidIp(arduinoIp)
    };
}