import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import Text from '@components/Text';
import useIsEligibleForRefund from '@hooks/useIsEligibleForRefund';
import useLocalize from '@hooks/useLocalize';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as User from '@libs/actions/User';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import PreTrialBillingBanner from './BillingBanner/PreTrialBillingBanner';
import CardSectionActions from './CardSectionActions';
import CardSectionDataEmpty from './CardSectionDataEmpty';
import CardSectionUtils from './utils';

function CardSection() {
    const [isRequestRefundModalVisible, setIsRequestRefundModalVisible] = useState(false);
    const {translate, preferredLocale} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const subscriptionPlan = useSubscriptionPlan();
    const isEligibleForRefund = useIsEligibleForRefund();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);

    const defaultCard = useMemo(() => Object.values(fundList ?? {}).find((card) => card.isDefault), [fundList]);

    const cardMonth = useMemo(() => DateUtils.getMonthNames(preferredLocale)[(defaultCard?.accountData?.cardMonth ?? 1) - 1], [defaultCard?.accountData?.cardMonth, preferredLocale]);

    const requestRefund = useCallback(() => {
        User.requestRefund();
        setIsRequestRefundModalVisible(false);
    }, []);

    const nextPaymentDate = !isEmptyObject(privateSubscription) ? CardSectionUtils.getNextBillingDate() : undefined;

    const sectionSubtitle = defaultCard && !!nextPaymentDate ? translate('subscription.cardSection.cardNextPayment', {nextPaymentDate}) : translate('subscription.cardSection.subtitle');
    const BillingBanner = <PreTrialBillingBanner />;

    return (
        <>
            <Section
                title={translate('subscription.cardSection.title')}
                subtitle={sectionSubtitle}
                isCentralPane
                titleStyles={styles.textStrong}
                subtitleMuted
                banner={BillingBanner}
            >
                <View style={[styles.mt8, styles.mb3, styles.flexRow]}>
                    {!isEmptyObject(defaultCard?.accountData) && (
                        <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                            <Icon
                                src={Expensicons.CreditCard}
                                additionalStyles={styles.subscriptionAddedCardIcon}
                                fill={theme.text}
                                medium
                            />
                            <View style={styles.flex1}>
                                <Text style={styles.textStrong}>{translate('subscription.cardSection.cardEnding', {cardNumber: defaultCard?.accountData?.cardNumber})}</Text>
                                <Text style={styles.mutedNormalTextLabel}>
                                    {translate('subscription.cardSection.cardInfo', {
                                        name: defaultCard?.accountData?.addressName,
                                        expiration: `${cardMonth} ${defaultCard?.accountData?.cardYear}`,
                                        currency: defaultCard?.accountData?.currency,
                                    })}
                                </Text>
                            </View>
                            <CardSectionActions />
                        </View>
                    )}
                </View>

                {isEmptyObject(defaultCard?.accountData) && <CardSectionDataEmpty />}
                {!!account?.hasPurchases && (
                    <MenuItem
                        shouldShowRightIcon
                        icon={Expensicons.History}
                        wrapperStyle={styles.sectionMenuItemTopDescription}
                        title={translate('subscription.cardSection.viewPaymentHistory')}
                        titleStyle={styles.textStrong}
                        onPress={() => Navigation.navigate(ROUTES.SEARCH.getRoute(CONST.SEARCH.TAB.ALL))}
                        hoverAndPressStyle={styles.hoveredComponentBG}
                    />
                )}
                {!!(subscriptionPlan && isEligibleForRefund) && (
                    <MenuItem
                        shouldShowRightIcon
                        icon={Expensicons.Bill}
                        wrapperStyle={styles.sectionMenuItemTopDescription}
                        style={styles.mt5}
                        title={translate('subscription.cardSection.requestRefund')}
                        titleStyle={styles.textStrong}
                        onPress={() => setIsRequestRefundModalVisible(true)}
                    />
                )}
            </Section>

            {isEligibleForRefund && (
                <ConfirmModal
                    title={translate('subscription.cardSection.requestRefund')}
                    isVisible={isRequestRefundModalVisible}
                    onConfirm={requestRefund}
                    onCancel={() => setIsRequestRefundModalVisible(false)}
                    prompt={
                        <>
                            <Text style={styles.mb4}>{translate('subscription.cardSection.requestRefundModal.phrase1')}</Text>
                            <Text>{translate('subscription.cardSection.requestRefundModal.phrase2')}</Text>
                        </>
                    }
                    confirmText={translate('subscription.cardSection.requestRefundModal.confirm')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            )}
        </>
    );
}

CardSection.displayName = 'CardSection';

export default CardSection;
