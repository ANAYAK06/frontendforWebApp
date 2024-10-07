import {useEffect, useRef} from 'react'
import isequal from 'lodash.isequal'


const useDeepCompareEffect  = (callback, dependencies)=>{
    const currentDependenciesRef = useRef()

    if(!isequal(currentDependenciesRef.current, dependencies)){
        currentDependenciesRef.current = dependencies
    }

    useEffect(callback, [callback, currentDependenciesRef.current])
}

export default useDeepCompareEffect