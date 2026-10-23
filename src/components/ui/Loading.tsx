import { View } from "react-native"
import { ActivityIndicator } from "react-native"

import ScreenHeader from "./ScreenHeader"
import ScreenContainer from "./ScreenContainer"


export default function Loading(){

    return(
        <ScreenContainer>
         <ScreenHeader title="Transactions" />
            <View className="flex-1 items-center justify-center py-20">
                <ActivityIndicator />
            </View>
        </ScreenContainer>
    )
}