import '../pages/index.css';

import { api } from './api.js';
import Card from './Card.js';
import Section from './Section.js';
import PopupWithImage from './PopupWithImage.js';
import PopupWithForm from './PopupWithForm.js';
import UserInfo from './UserInfo.js';
import FormValidator from './FormValidator.js';

const buttonEdit = document.querySelector('.profile__edit-button');
const buttonAddPlace = document.querySelector('.profile__add-button');
const buttonAvatarEdit = document.querySelector('.profile__avatar-container');


// let userId = 1;

const userProfileSelectors = {
  usernameSelector: '.profile__username',
  userAboutSelector: '.profile__user-position',
  userAvatarSelector: '.profile__avatar'
}

const validationConfig = {
  formSelector: ".popup__input-container",
  inputSelector: ".popup__item",
  submitButtonSelector: ".popup__button",
  inputErrorClass: "popup__item_type_error",
  inputErrorActiveClass: "popup__item-error_active",
};

const userProfile = new UserInfo(userProfileSelectors);

//popupImage
const popupImage = new PopupWithImage('.popup_type_img');
popupImage.setEventListeners();




Promise.all([api.getUserProfile(), api.getCards()])
  // тут деструктурируете ответ от сервера, чтобы было понятнее, что пришло
  // .then((results) => {
  //   const userData = results[0];
  //   const cards = results[1];
  // })
  .then((results) => {
    const userData = results[0];
    const cards = results[1];
    // тут установка данных пользователя
    // fillProfile(userData);

    const userId = userData._id;
    userProfile.renderInfoProfile(userData);

    // и тут отрисовка карточек

    const cardList = new Section({
      data: cards,
      renderer: (element) => {
        const newCard = new Card(element, userId, (cardId) => { return api.likeCard(cardId) }, (cardId) => { return api.dislikeCard(cardId) }, (cardId) => api.delCard(cardId), '#element-template', popupImage.open.bind(popupImage));
        const cardElement = newCard.generate();
        cardList.setItem(cardElement);
      }
    }, '.elements');

    cardList.renderItems();

    //Создание попапов




    //popupEdit
    const popupEditValidation = new FormValidator(validationConfig, document.forms.userprofileform);
    popupEditValidation.enableValidation();

    const popupEdit = new PopupWithForm('.popup_type_profile', function () { return userProfile.setUserInfo(popupEdit._getInputValues(), api.patchProfile.bind(api)) }, popupEditValidation.cleanValidationErrors.bind(popupEditValidation), api.getUserProfile.bind(api));
    popupEdit.setEventListeners();
    buttonEdit.addEventListener('click', popupEdit.open.bind(popupEdit));



    //popupAddCard

    const popupAddCardValidation = new FormValidator(validationConfig, document.forms.cardCreateForm);
    popupAddCardValidation.enableValidation();

    const popupAddCard = new PopupWithForm('.popup_type_card', async function () {
      return await api.postCard(popupAddCard._getInputValues())
        .then((element) => {
          cardList._renderedItems.unshift(element);
          cardList.renderItems();
        })
        .catch((err) => console.log(`Ошибка: ${err}`))
    }, popupAddCardValidation.cleanValidationErrors.bind(popupAddCardValidation));
    popupAddCard.setEventListeners();
    buttonAddPlace.addEventListener('click', popupAddCard.open.bind(popupAddCard))


    //popupAvatar
    const popupAvatarValidation = new FormValidator(validationConfig, document.forms.useravatarform);
    popupAvatarValidation.enableValidation();

    const popupAvatar = new PopupWithForm('.popup_type_avatar', async function () {
      const avatar = popupAvatar._getInputValues();
      return await userProfile.setUserAvatar(avatar, api.patchAvatar.bind(api))
    }, popupAvatarValidation.cleanValidationErrors.bind(popupAvatarValidation))
    popupAvatar.setEventListeners();
    buttonAvatarEdit.addEventListener('click', popupAvatar.open.bind(popupAvatar));

  })
  .catch(err => {
    // тут ловим ошибку
    console.log(err);
  });


