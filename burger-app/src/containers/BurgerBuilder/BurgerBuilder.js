import React, {
    Component
} from 'react';
import {
    connect
} from 'react-redux';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import axios from '../../axios-orders';
import Auxiliary from '../../hoc/Auxiliary/Auxiliary';
import withErrorHandler from '../../hoc/withErrorHandler/widthErrorHandler';
import * as action from '../../store/actions/index';

export class BurgerBuilder extends Component {

    state = {
        purchasable: false,
        purchasing: false,
        loading: false,
    }

    componentDidMount() {

        // Fetch asynchonously data from server
        this.props.onInitIngredients();
    }

    updatePurchaseState(ingredients) {
        const sum = Object.keys(ingredients)
            .map(igKey => {
                return ingredients[igKey];
            })
            .reduce((sum, el) => {
                return sum + el;
            }, 0);
        this.setState({
            purchasable: sum > 0
        });
    }

    purchaseHandler = () => {
        if (this.props.isAuthenticated) {
            this.setState({
                purchasing: true
            });
        } else {
            this.props.onSetAuthRedirectPath('/checkout');
            this.props.history.push('/auth');
        }
    }

    purchaseCancelHandler = () => {
        this.setState({
            purchasing: false
        });
    }

    purchaseContinueHandler = () => {
        this.props.onInitPurchase();
        this.props.history.push('/checkout');
    }

    render() {
        const disabledInfo = {
            ...this.props.ings
        };
        for (let key in disabledInfo) {
            disabledInfo[key] = disabledInfo[key] <= 0
        }
        let orderSummary = null;
        let burger = this.props.error ? < p > Ingredients can 't be loaded!</p> : <Spinner />;

        if (this.props.ings) {
            burger = ( <
                Auxiliary >
                <
                Burger ingredients = {
                    this.props.ings
                }
                /> <
                BuildControls ingredientAdded = {
                    this.props.onIngredientAdded
                }
                ingredientRemoved = {
                    this.props.onIngredientRemoved
                }
                disabled = {
                    disabledInfo
                }
                purchasable = {
                    this.state.purchasable
                }
                ordered = {
                    this.purchaseHandler
                }
                isAuth = {
                    this.props.isAuthenticated
                }
                price = {
                    this.props.price
                }
                /> <
                /Auxiliary>
            );
            orderSummary = < OrderSummary
            ingredients = {
                this.props.ings
            }
            price = {
                this.props.price
            }
            purchaseCancelled = {
                this.purchaseCancelHandler
            }
            purchaseContinued = {
                this.purchaseContinueHandler
            }
            />;
        }
        if (this.state.loading) {
            orderSummary = < Spinner / > ;
        }
        // {salad: true, meat: false, ...}
        return ( <
            Auxiliary >
            <
            Modal show = {
                this.state.purchasing
            }
            modalClosed = {
                this.purchaseCancelHandler
            } > {
                orderSummary
            } <
            /Modal> {
                burger
            } <
            /Auxiliary>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        ings: state.burgerBuilder.ingredients,
        price: state.burgerBuilder.totalPrice,
        error: state.burgerBuilder.error,
        isAuthenticated: state.auth.token !== null,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onIngredientAdded: (ingName) => dispatch(action.addIngredient(ingName)),
        onIngredientRemoved: (ingName) => dispatch(action.removeIngredient(ingName)),
        onInitIngredients: () => dispatch(action.initIngredients()),
        onInitPurchase: () => dispatch(action.purchaseInit()),
        onSetAuthRedirectPath: () => dispatch(action.setAuthRedirectPath()),
    }
}



export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(BurgerBuilder, axios));