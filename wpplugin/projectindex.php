<?php
	//Copyright 2014 Scott Silver Labs
	/**
	 * Plugin Name: Project Indexer
	 * Description: Indexes all posts parented to a user-defined page and provides a search and sorting interface.
	 * Author:      Scott Silver Labs
	 * Author URI:  http://scottsilverlabs.com
	 * Version:     1.0.1
	 */
	$javascript = <<<EOT

EOT;

	function pi_check($content) { //Prefixed to avoid collision.
		global $javascript;
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
			foreach ($projects as $p) {
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
				array_push($arr, [
					"name" => $p->post_title,
					"url" => $p->guid,
					"difficulty" => (int) $hdiff,
					"cells" => $hw,
					"category" => $category,
					"lid" => $lid,
					"description" => $descActual
				]);
			}
			return "<script type=\"text/javascript\"> var posts = " . json_encode($arr) . $javascript . "</script>";
		}
		return $content;
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
 
	$plugin = plugin_basename(__FILE__); 
	add_filter("the_content", "pi_check");
	add_action("admin_menu", "pi_admin_menu");
	add_filter("plugin_action_links_$plugin", "pi_settingslink");