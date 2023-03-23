import featherIcon from 'assets/svg/feather-sprite.svg'
import { GoogleEventColours } from '../../../handleColorPalette'

export const SetProjectColourDropdown = ({ setProjectColour }) => {
  return (
    <div className='add-project__set-selected-color'>
      <div className='add-project__set-selected-color--option'>
        <ul>
          {GoogleEventColours &&
            GoogleEventColours.map((colour) => (
              <li
                key={colour.name}
                className='add-project__colour-dropdown--option'
                onClick={() => setProjectColour(colour)}
              >
                <div className='add-project__colour-dropdown--option-color'>
                  <svg
                    className=''
                    width='14'
                    height='14'
                    fill={`${colour.hex}`}
                  >
                    <use href={`${featherIcon}#circle`}></use>
                  </svg>
                </div>

                <p className='add-project__colour-dropdown--option-name'>
                  {colour.name}
                </p>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
