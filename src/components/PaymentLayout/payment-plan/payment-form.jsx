import { ReactComponent as EyeOpen } from 'assets/svg/eye-off.svg'
import { ReactComponent as EyeClosed } from 'assets/svg/eye-on.svg'
import { FeatherIcons } from 'assets/svg/feather-icons'
import { Spinner } from 'components/Spinner'
import { useAuth } from 'hooks'
import { useState } from 'react'
import { Link } from 'react-router-dom'
export const PaymentForm = () => {

  return (
    <>{/*
      <div className='error-block'>
        {showDefaultErrorMessage && (
          <div className='error-message'>
            <FeatherIcons
              id='alert-circle'
              width={20}
              height={20}
              fill='#333'
              stroke={'#fff'}
              strokeWidth={2}
              currentColor={'#fff'}
            />
            {errorMessage}
          </div>
        )}
        {!emailIsValid && (
          <div className='error-message'>
            <FeatherIcons
              id='alert-circle'
              width={20}
              height={20}
              fill='#333'
              stroke={'#fff'}
              strokeWidth={2}
              currentColor={'#fff'}
            />
            {errorMessage}
          </div>
        )}
        </div>*/}
      <form className='payment-form'>
        <div className='field'>
          <label htmlFor='cardNumber' className='label'>
            Card Number
          </label>
          <input
            type='cardNumber'
            name='cardNumber'
            id='cardNumber'
            placeholder='1234 1234 1234 1234'
            /*value={formState.email}*/
            /*onChange={(e) => onChangeHandler(e)}*/
          />
        </div>
        <div className='field'>
          <label htmlFor='cardExpiration' className='label'>
            Card Expiration
          </label>
          <input
            type='cardExpiration'
            name='cardExpiration'
            id='cardExpiration'
            placeholder='MM / YY'
            /*value={formState.email}*/
            /*onChange={(e) => onChangeHandler(e)}*/
          />
        </div>
        <div className='field'>
          <label htmlFor='CVC' className='label'>
          CVC
          </label>
          <input
            type='CVC'
            name='CVC'
            id='CVC'
            placeholder='CVC'
            /*value={formState.email}*/
            /*onChange={(e) => onChangeHandler(e)}*/
          />
        </div>
        <div className='field'>
          <label htmlFor='country' className='label'>
            Country
          </label>
          <input
            type='country'
            name='country'
            id='country'
            /*value={formState.email}*/
            /*onChange={(e) => onChangeHandler(e)}*/
          />
        </div>
        <div className='field'>
          <label htmlFor='postal' className='label'>
            Postal Code
          </label>
          <input
            type='postal'
            name='postal'
            id='postal'
            /*value={formState.email}*/
            /*onChange={(e) => onChangeHandler(e)}*/
          />
        </div>

        <button
          className='payment-button submit-button'
          /*onClick={(e) => handleSubmit(e)}*/
        >
          Complete Payment
          {/*{authenticating && <Spinner light />}*/}
        </button>

        <hr />
      </form>
    </>
  )
}
