import { useContext } from 'react'
import { PlayerContext } from '../context/PlayerContext'

export default function usePlayer(){
  return useContext(PlayerContext)
}
