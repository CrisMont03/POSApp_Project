import { useState } from "react";
import { View, Text, Button, Modal } from "react-native";

interface CameraModalProps {
    isVisible: boolean;
    image?: any;
}

export default function CameraModal(props: CameraModalProps) {
    const [facing, setFacing] = useState<CameraType>('back');
    
}