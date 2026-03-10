import React, { useEffect, useRef } from 'react';
import { Text, TextStyle, Animated, Easing } from 'react-native';

interface AnimatedScoreProps {
    value: number;
    style?: TextStyle | TextStyle[];
}

export function AnimatedScore({ value, style }: AnimatedScoreProps) {
    const animatedValue = useRef(new Animated.Value(value)).current;
    const [displayValue, setDisplayValue] = React.useState(value);

    useEffect(() => {
        animatedValue.setValue(displayValue);
        Animated.timing(animatedValue, {
            toValue: value,
            duration: 350,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();

        const listenerId = animatedValue.addListener(({ value: v }) => {
            setDisplayValue(Math.round(v));
        });

        return () => {
            animatedValue.removeListener(listenerId);
        };
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Text style={style}>{displayValue}</Text>
    );
}
