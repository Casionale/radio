<?php
/**
 * Button visually impaired.
 *
 * @package Bvi
 * @author Veks
 * @since   1.0.0
 */

/**
 * Plugin Name: Button visually impaired
 * Plugin URI: http://bvi.isvek.ru/
 * Description: Button visually impaired — это плагин, который автоматически изменяет версию вашего сайта для слабовидящих людей. Панель на сайте для слабовидящих дает возможность изменять цветовую гамму сайта, размеры шрифтов, синтезатор речи озвучит вслух изменения настроек. С помощью неё можно изменять функции сайта, которые удовлетворят потребностями людей с ограниченными возможностями.
 * Version: 2.3.0
 * Author: Veks
 * Text Domain: bvi
 * Domain Path: /languages
 * Author URI: https://github.com/veks
 * License: GPLv2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 */

defined( 'ABSPATH' ) || exit;

define( 'BVI_DIR_PATH', plugin_dir_path( __FILE__ ) );
define( 'BVI_URL', plugin_dir_url( __FILE__ ) );
define( 'BVI_FILE', __FILE__ );
define( 'BVI_LANG_PATH', dirname( plugin_basename( __FILE__ ) ) . '/languages' );

const BVI_URL_CSS     = BVI_URL . 'assets/css/';
const BVI_URL_JS      = BVI_URL . 'assets/js/';
const BVI_VERSION     = '2.3.0';
const BVI_PHP_VERSION = '7.4';

/**
 * Bvi only works in PHP 7.4 or later
 */
if ( version_compare( PHP_VERSION, BVI_PHP_VERSION, '<' ) ) {
	add_action( 'admin_notices', function () {
		echo sprintf(
			__( '<div class="notice notice-error is-dismissible"><p>Для работы плагина Button visually impaired требуется минимум версия <strong>%1$s</strong> PHP. У Вас <strong>%2$s</strong>PHP версия.</p></div>', 'bvi' ),
			BVI_PHP_VERSION,
			PHP_VERSION
		);
	} );
}

if ( file_exists( BVI_DIR_PATH . 'include/vendor/autoload.php' ) ) {

	/**
	 * PHP namespace autoloader
	 */
	require_once BVI_DIR_PATH . 'include/vendor/autoload.php';
}

if ( class_exists( '\\Bvi\\Core\\Loader' ) ) {

	/**
	 * Loader classes.
	 */
	Bvi\Core\Loader::getInstance()->setClasses( [
		Bvi\Core\Bvi::class,
		Bvi\Core\Admin::class
	] )->register();
}

if ( class_exists( '\\Bvi\\Core\\Activate' ) ) {

	/**
	 * Activate plugin hook.
	 */
	$core = new \Bvi\Core\Core();

/*
if ( false === $core->getOption() ) {
    Bvi\Core\Activate::getInstance()->activation();
}
*/

	register_activation_hook( BVI_FILE, function () {
		Bvi\Core\Activate::getInstance()->activation();
	} );
}

if ( class_exists( '\\Bvi\\Core\\Upgrade' ) ) {

	/**
	 * Upgrade plugin.
	 */
	Bvi\Core\Upgrade::getInstance()->registerUpgrade();
}
