import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: {
        name:"",
        email:"",
        token:"",
        id:"",
        role:"",
    }
}

export const userSlice = createSlice({
    name:'user',
    initialState,
    reducers: {
        addUser: (state, action)=>{
            const user = {
                name:action.payload.name,
                email:action.payload.email,
                token:action.payload.token,
                id:action.payload.id,
                role:action.payload.role,
            }
            state.user = user;
        },
        removeUser: (state)=>{
            state.user = {
                name:"",
                email:"",
                token:"",
                id:"",
                role:"",
            }
        }
    }
});

export const {addUser, removeUser} = userSlice.actions;

export default userSlice.reducer;