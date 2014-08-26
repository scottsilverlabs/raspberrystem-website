<?php
	//Copyright 2014 Scott Silver Labs
	/**
	 * Plugin Name: Project Indexer
	 * Description: Indexes all posts parented to a user-defined page and provides a search and sorting interface.
	 * Author:	  Scott Silver Labs
	 * Author URI:  http://scottsilverlabs.com
	 * Version:	 1.0.1
	 */
	$javascript = <<<EOT

EOT;

	function pi_check($content) { //Prefixed to avoid collision.
		global $javascript;
		global $wpdb;
		$tableName = $wpdb->prefix . "pi_ratings";
		$eggsName = $wpdb->prefix . "pi_eggs";
		$pname = $pid = null;
		$page = get_page_by_title(get_option("pi_parenttitle", "Projects"));
		if ($page != null){
			$pname = $page->post_name;
			$pid = $page->ID;
		}
		if ($GLOBALS["post"]->post_name == $pname) {
			$arr = []; //Storing data to pass to the JavaScript portion of the plugin
			//http://codex.wordpress.org/Function_Reference/get_pages#Return
			$projects = get_pages(array("child_of" => $GLOBALS["post"]->ID, "post_status" => "publish"));
			$docs = get_pages(array("child_of" => get_page_by_title("Documents")->ID, "post_status" => "publish"));
			$darr = ["force" => "dictionary"];
			foreach ($docs as $d) {
				$darr[$d->post_title] = $d->guid;
			}
			$user = wp_get_current_user()->ID;
			$loggedIn = $user != 0;
			foreach ($projects as $p) {
				$author = get_user_by("id", $p->post_author);
				$authorName = "Unknown";
				if ($author){
					$authorName = $author->get("first_name") . " " . $author->get("last_name");
				}
				$c = explode("\n", $p->post_content); //For easy of use
				$hdiff = explode(":", $c[0])[1];
				$hw = explode(":", $c[1])[1];	
				$category = explode(":", $c[2])[1];
				$lid = explode(":", $c[3])[1];
				$desc = explode(":", $c[4]);
				$descActual = null;
				if (sizeof($desc) > 1) {
					$descActual = $desc[1];
				}
				$rating = $wpdb->get_col("SELECT rating FROM $tableName WHERE project = $p->ID AND user = 0");
				if ($rating == null) {
					$rating = 1;
				} else {
					$rating = (float) $rating[0];
				}
				$userrating = null;
				if ($loggedIn){
					$userrating = $wpdb->get_col("SELECT rating FROM $tableName WHERE project = $p->ID AND user = $user");
					if ($userrating != null) {
						$userrating = (float) $userrating[0];
					}
				}
				array_push($arr, [
					"name" => $p->post_title,
					"id" => $p->ID,
					"url" => $p->guid,
					"difficulty" => (int) $hdiff,
					"cells" => $hw,
					"category" => $category,
					"lid" => $lid,
					"description" => $descActual,
					"rating" => $rating,
					"userrating" => $userrating,
					"author" => $authorName
				]);
			}
			$diff = null;
			$rate = null;
			if ($loggedIn) {
				$easterEggs = $wpdb->prefix . "pi_eggs";
				$diff = $wpdb->get_var("SELECT diff FROM $easterEggs WHERE user = $user;");
				$rate = $wpdb->get_var("SELECT rate FROM $easterEggs WHERE user = $user;");
			}
			if ($diff != null) {
				$diff = "var diffImage = \"" . $diff . "\";";
			} else {
				$diff = "var diffImage;";
			}
			if ($rate != null) {
				$rate = "var rateImage = \"" . $rate . "\";";
			} else {
				$rate = "var rateImage;";
			}
			wp_enqueue_script("jquery");
			wp_enqueue_style("projectindexer", "//dev.raspberrystem.com/wphidden42/wp-content/plugins/projectindexer/plugin.css");
			return "<script type=\"text/javascript\"> " . $diff . $rate . " var loggedIn = " . (($loggedIn) ? "true" : "false") . ";var wpurl = \"" . home_url() . "\";var posts = " . json_encode($arr) . "; var cellurls = " . json_encode($darr) . ";" . $javascript . "</script>";
		}
		return $content;
	}
	
	//This will handle posts sent by the JS side.
	function pi_handle_post() {
		global $wpdb;
		$tableName = $wpdb->prefix . "pi_ratings";
		$user = wp_get_current_user()->ID;
		if ($_POST["project"] != null && $user != 0) {
			$rating = intval($_POST["rating"]);
			$page = intval($_POST["project"]);
			$sum = 0;
			$count = 0;
			$wpdb->delete($tableName, array("project" => $page, "user" => $user));
			$wpdb->delete($tableName, array("project" => $page, "user" => 0));
			$res = $wpdb->get_results("SELECT * FROM $tableName WHERE project = $page;", ARRAY_A);
			foreach ($res as $row) {
				$count++;
				$sum += $row["rating"];
			}
			$avg = floatval(($sum + $rating)/(++$count));
			$wpdb->insert($tableName, ["project" => $page, "user" => 0, "rating" => $avg]);
			$wpdb->insert($tableName, ["project" => $page, "user" => $user, "rating" => $rating]);
			die($avg);
		}
		if ($_POST["prop"] != null && $user != 0) {
			if ($_POST["img"] == "NULL") {
				$_POST["img"] = null;
			}
			$tableName = $wpdb->prefix . "pi_eggs";
			if ($wpdb->get_var("SELECT COUNT(1) FROM $tableName WHERE user = $user;") == 0) {
				$wpdb->insert($tableName, ["user" => $user, $_POST["prop"] => $_POST["img"]]);
			} else {
				$wpdb->update($tableName, [$_POST["prop"] => $_POST["img"]], ["user" => $user]);
			}
			die("good");
		}
		die("goto login");
	}

	function pi_options_actual() {
		$ptitle = get_option("pi_parenttitle", "Projects");
		?>
		<div class="wrap">
			<h2>Project Indexer</h2>
			<form method="post" action="options.php">
				<?php
					settings_fields("pimainsettings");
					do_settings_sections("pimainsettings");
				?>
				<table class="form-table">
					<tr valign="top"><th scope="row">Projects' Parent Title:</th>
						<td><input type="text" name="pi_parenttitle" value="<?php echo $ptitle; ?>" /></td>
					</tr>
				</table>
				<?php submit_button(); ?>
			</form>
		</div>
		<?php
	}

	function pi_admin_init() {
		 register_setting("pimainsettings", "pi_parenttitle");
	}

	function pi_admin_menu() {
		add_action("admin_init", "pi_admin_init");
		add_options_page("Project Indexer", "Project Indexer", "manage_options", "project_indexer_opts", "pi_options_actual");

	}

	function pi_settingslink($links) { 
		$settings_link = "<a href=\"options-general.php?page=project_indexer_opts.php\">Settings</a>"; 
		array_push($links, $settings_link); 
		return $links;
	}

	function pi_init_db() {
		global $wpdb;
		$tableName = $wpdb->prefix . "pi_ratings";
		$sql = "CREATE TABLE IF NOT EXISTS $tableName (
	project int,
	user int,
	rating float
);";
		$wpdb->query($sql);
		$tableName = $wpdb->prefix . "pi_eggs";
		$sql = "CREATE TABLE IF NOT EXISTS $tableName (
	user int,
	diff char(255),
	rate char(255),
	PRIMARY KEY (user)
);";
		$wpdb->query($sql);
	}

	register_activation_hook(__FILE__, "pi_init_db");
	$plugin = plugin_basename(__FILE__);
	add_filter("the_content", "pi_check");
	add_filter("wp_ajax_rate_project", "pi_handle_post");
	add_action("admin_menu", "pi_admin_menu");
	add_filter("plugin_action_links_$plugin", "pi_settingslink");
